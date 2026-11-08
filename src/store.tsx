import AsyncStorage from "@react-native-async-storage/async-storage";
import { digestStringAsync, CryptoDigestAlgorithm } from "expo-crypto";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { closeTrip, startTrip, type Draft, type NewTrip, type Trip } from "@/ledger";

const storageKey = "trip-wallet-accounts-v1";

export type User = {
  name: string;
  email: string;
};

type Account = User & {
  passwordHash: string;
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
  start: (input: NewTrip) => boolean;
  close: () => void;
  commit: (trip: Trip) => void;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  logIn: (email: string, password: string) => Promise<string | null>;
  logOut: () => void;
};

const TripContext = createContext<TripStore | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(email: string, password: string) {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, `${email}:${password}`);
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [session, setSession] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const user = session ? accounts[session] ?? null : null;
  const trip = user?.trip ?? null;

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as Snapshot;
        setAccounts(parsed.accounts ?? {});
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

  function writeTrip(next: Trip | null | ((current: Trip | null) => Trip | null)) {
    if (!session) return;
    setAccounts((current) => {
      const account = current[session];
      if (!account) return current;
      const tripValue = typeof next === "function" ? next(account.trip) : next;
      return { ...current, [session]: { ...account, trip: tripValue } };
    });
  }

  const store = useMemo<TripStore>(
    () => ({
      ready,
      user: user ? { name: user.name, email: user.email } : null,
      trip,
      draft,
      notice,
      beginCharge: () => setDraft(null),
      saveCaps: (next) => setDraft(next),
      start: (input) => {
        const result = startTrip(trip, input);
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
        const account: Account = { name: trimmedName, email: key, passwordHash, trip: null };
        setAccounts((current) => ({ ...current, [key]: account }));
        setSession(key);
        setDraft(null);
        setNotice(null);
        return null;
      },
      logIn: async (email, password) => {
        const key = normalizeEmail(email);
        const account = accounts[key];
        if (!account) return "No account for that email.";
        const passwordHash = await hashPassword(key, password);
        if (passwordHash !== account.passwordHash) return "Wrong password.";
        setSession(key);
        setDraft(null);
        setNotice(null);
        return null;
      },
      logOut: () => {
        setSession(null);
        setDraft(null);
        setNotice(null);
      },
    }),
    [accounts, draft, notice, ready, session, trip, user],
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
