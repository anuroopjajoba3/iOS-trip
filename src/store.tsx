import AsyncStorage from "@react-native-async-storage/async-storage";
import { digestStringAsync, CryptoDigestAlgorithm } from "expo-crypto";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  closeTrip,
  issueTripCard,
  makeRegisteredCard,
  panEndingIn,
  startTrip,
  type Draft,
  type IssuedCard,
  type Person,
  type RegisteredCard,
  type Trip,
  type TripFriend,
} from "@/ledger";

function asPerson(
  person: { id: string; name: string; card?: RegisteredCard },
  fallback?: RegisteredCard,
): Person {
  if (person.card?.pan || person.card?.last4) {
    const card = person.card.pan
      ? person.card
      : makeRegisteredCard(person.card.kind ?? "debit", person.card.last4, person.card.limitCents ?? 0);
    return { id: person.id, name: person.name, card };
  }
  return {
    id: person.id,
    name: person.name,
    card: fallback ?? makeRegisteredCard("debit", "0000", 0),
  };
}

function asTrip(value: Trip | null): Trip | null {
  if (!value) return null;
  const legacy = value as Trip & {
    paySplit?: { last4: string; exp: string; active: boolean };
    funding?: Array<{ name: string; last4: string; remainingCents: number; capCents?: number }>;
  };
  const card = value.card ?? (legacy.paySplit ? { name: "Trip card", kind: "debit" as const, ...legacy.paySplit } : undefined);
  if (!card) return value;
  const people = (value.people ?? []).map((person, index) => {
    const fromFunding = legacy.funding?.[index];
    const fallback = fromFunding
      ? makeRegisteredCard("debit", fromFunding.last4, fromFunding.capCents ?? fromFunding.remainingCents)
      : undefined;
    return asPerson(person, fallback);
  });
  return {
    ...value,
    card: {
      ...card,
      name: card.name || "Trip card",
      kind: card.kind ?? "debit",
      pan: card.pan ?? panEndingIn(card.last4 || "0000"),
      last4: card.last4 || (card.pan ? card.pan.slice(-4) : "0000"),
      cvv: card.cvv ?? "000",
      inWallet: card.inWallet ?? false,
    },
    place: value.place ?? value.name,
    people,
    photos: value.photos ?? [],
    charges: (value.charges ?? []).map((charge) => ({
      ...charge,
      collections: charge.collections ?? [],
    })),
  };
}

const storageKey = "trip-wallet-accounts-v5";

export type User = {
  name: string;
  email: string;
  tripCard: IssuedCard | null;
  revealedTripCard: boolean;
};

type Account = {
  name: string;
  email: string;
  passwordHash: string;
  tripCard: IssuedCard | null;
  revealedTripCard: boolean;
  trip: Trip | null;
};

type Snapshot = {
  accounts: Record<string, Account>;
  session: string | null;
};

type TripStore = {
  ready: boolean;
  user: User | null;
  trip: Trip | null;
  draft: Draft | null;
  notice: string | null;
  beginCharge: () => void;
  saveCaps: (draft: Draft) => void;
  start: (name: string, ownerCard: RegisteredCard, friends: TripFriend[]) => boolean;
  close: () => void;
  commit: (trip: Trip) => void;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  logIn: (email: string, password: string) => Promise<string | null>;
  acceptTripCard: () => void;
  addToWallet: () => void;
  logOut: () => void;
};

const TripContext = createContext<TripStore | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(email: string, password: string) {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, `${email}:${password}`);
}

function asAccount(item: Account & { card?: RegisteredCard | IssuedCard }): Account {
  return {
    name: item.name,
    email: item.email,
    passwordHash: item.passwordHash,
    tripCard: item.tripCard ?? issueTripCard(),
    revealedTripCard: item.revealedTripCard ?? false,
    trip: asTrip(item.trip),
  };
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [session, setSession] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const account = session ? accounts[session] ?? null : null;
  const user = account
    ? {
        name: account.name,
        email: account.email,
        tripCard: account.tripCard,
        revealedTripCard: account.revealedTripCard,
      }
    : null;
  const trip = account?.trip ?? null;

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as Snapshot;
        const next = Object.fromEntries(
          Object.entries(parsed.accounts ?? {}).map(([email, item]) => [email, asAccount(item)]),
        );
        setAccounts(next);
        setSession(parsed.session ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const snapshot: Snapshot = { accounts, session };
    AsyncStorage.setItem(storageKey, JSON.stringify(snapshot)).catch(() => undefined);
  }, [accounts, ready, session]);

  function writeAccount(patch: Partial<Account>) {
    if (!session) return;
    setAccounts((current) => {
      const item = current[session];
      if (!item) return current;
      return { ...current, [session]: { ...item, ...patch } };
    });
  }

  function writeTrip(next: Trip | null | ((current: Trip | null) => Trip | null)) {
    if (!session) return;
    setAccounts((current) => {
      const item = current[session];
      if (!item) return current;
      const tripValue = typeof next === "function" ? next(item.trip) : next;
      return { ...current, [session]: { ...item, trip: tripValue } };
    });
  }

  const store = useMemo<TripStore>(
    () => ({
      ready,
      user,
      trip,
      draft,
      notice,
      beginCharge: () => setDraft(null),
      saveCaps: (next) => setDraft(next),
      start: (name, ownerCard, friends) => {
        if (!account?.tripCard) {
          setNotice("Your trip card is not ready.");
          return false;
        }
        const result = startTrip(
          trip,
          { name, ownerName: account.name, friends },
          ownerCard,
          account.tripCard,
        );
        if (!result.ok) {
          setNotice("Starting another trip is declined until this one is closed.");
          return false;
        }
        setNotice(null);
        setDraft(null);
        writeTrip(result.trip);
        return true;
      },
      close: () => {
        writeTrip((current) => (current ? closeTrip(current) : current));
        setDraft(null);
      },
      commit: (next) => writeTrip(next),
      signUp: async (name, email, password) => {
        const trimmedName = name.trim();
        const key = normalizeEmail(email);
        if (!trimmedName) return "Enter your name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "Enter a valid email.";
        if (password.length < 6) return "Use at least 6 characters.";
        if (accounts[key]) return "That email already has an account.";
        const passwordHash = await hashPassword(key, password);
        const next: Account = {
          name: trimmedName,
          email: key,
          passwordHash,
          tripCard: issueTripCard(),
          revealedTripCard: false,
          trip: null,
        };
        setAccounts((current) => ({ ...current, [key]: next }));
        setSession(key);
        setDraft(null);
        setNotice(null);
        return null;
      },
      logIn: async (email, password) => {
        const key = normalizeEmail(email);
        const item = accounts[key];
        if (!item) return "No account for that email.";
        const passwordHash = await hashPassword(key, password);
        if (passwordHash !== item.passwordHash) return "Wrong password.";
        setSession(key);
        setDraft(null);
        setNotice(null);
        return null;
      },
      acceptTripCard: () => writeAccount({ revealedTripCard: true }),
      addToWallet: () => {
        if (!account?.tripCard) return;
        writeAccount({ tripCard: { ...account.tripCard, inWallet: true } });
      },
      logOut: () => {
        setSession(null);
        setDraft(null);
        setNotice(null);
      },
    }),
    [account, accounts, draft, notice, ready, session, trip, user],
  );

  return <TripContext.Provider value={store}>{children}</TripContext.Provider>;
}

export function useTrip(): TripStore {
  const store = useContext(TripContext);
  if (!store) {
    throw new Error("useTrip must be used within TripProvider");
  }
  return store;
}
