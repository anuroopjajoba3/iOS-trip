/**
 * The merchant charges one Trip card for the full cart.
 * You plus up to five friends sit under that card, each with their own credit or debit card.
 * Every approved cart is split equally across those cards, so nobody fronts the trip.
 * If anyone cannot cover their equal share, the whole cart is declined.
 */

export type CardKind = "credit" | "debit";

export type RegisteredCard = {
  kind: CardKind;
  last4: string;
  limitCents: number;
  remainingCents: number;
  exp: string;
  active: boolean;
};

export type Person = {
  id: string;
  name: string;
  card: RegisteredCard;
};

export type Collection = {
  personId: string;
  name: string;
  last4: string;
  amountCents: number;
};

export type Charge = {
  id: string;
  merchant: string;
  amountCents: number;
  collections: Collection[];
  receiptUri?: string;
};

export type Photo = {
  id: string;
  uri: string;
};

export type IssuedCard = {
  name: string;
  kind: CardKind;
  last4: string;
  exp: string;
  active: boolean;
};

export type Trip = {
  id: string;
  name: string;
  dates: string;
  place: string;
  budgetCents: number;
  status: "open" | "closed";
  card: IssuedCard;
  charges: Charge[];
  people: Person[];
  photos: Photo[];
};

export type Draft = {
  merchant: string;
  cartCents: number;
};

export type DeclineReason = "cap-exceeds-card" | "inactive";

export type ChargeResult =
  | { ok: true; trip: Trip; collections: Collection[] }
  | { ok: false; reason: DeclineReason };

export type TripFriend = {
  name: string;
  card: RegisteredCard;
};

export type NewTrip = {
  name: string;
  ownerName: string;
  friends: TripFriend[];
};

export const maxFriends = 5;
export const maxPeople = maxFriends + 1;

export function spentCents(trip: Trip): number {
  return trip.charges.reduce((sum, charge) => sum + charge.amountCents, 0);
}

export function leftCents(trip: Trip): number {
  return trip.people.reduce((sum, person) => sum + person.card.remainingCents, 0);
}

export function declineCopy(reason: DeclineReason): string {
  if (reason === "inactive") {
    return "This trip card cannot be charged.";
  }
  return "Someone on the trip cannot cover an equal share.";
}

export function masked(last4: string): string {
  return `····${last4}`;
}

export function formatDollars(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(Math.trunc(cents));
  const dollars = Math.floor(absolute / 100);
  const fraction = absolute % 100;
  return `${negative ? "-" : ""}$${dollars}.${fraction.toString().padStart(2, "0")}`;
}

/** Exact cents. Empty is missing. Zero is a real amount. More than two decimals is rejected. */
export function parseCents(value: string): number | null {
  const trimmed = value.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [dollars, fraction = ""] = trimmed.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) {
    return null;
  }
  return cents;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parseLast4(value: string): string | null {
  const digits = value.trim();
  if (!/^\d{4}$/.test(digits)) {
    return null;
  }
  return digits;
}

export function issueCard(now = new Date()): { exp: string } {
  const expDate = new Date(now);
  expDate.setFullYear(expDate.getFullYear() + 2);
  const month = String(expDate.getMonth() + 1).padStart(2, "0");
  const year = String(expDate.getFullYear()).slice(-2);
  return { exp: `${month}/${year}` };
}

export function makeRegisteredCard(
  kind: CardKind,
  last4: string,
  limitCents: number,
  now = new Date(),
): RegisteredCard {
  return {
    kind,
    last4,
    limitCents,
    remainingCents: limitCents,
    exp: issueCard(now).exp,
    active: true,
  };
}

export function cardLabel(kind: CardKind) {
  return kind === "credit" ? "Credit" : "Debit";
}

/**
 * Split a cart into equal cent shares.
 * Leftover cents go to the first people so the shares still sum to the cart.
 */
export function equalShares(cartCents: number, people: number): number[] {
  if (people <= 0) return [];
  const base = Math.floor(cartCents / people);
  const extra = cartCents % people;
  return Array.from({ length: people }, (_, index) => base + (index < extra ? 1 : 0));
}

export function chargeTrip(trip: Trip, draft: Draft): ChargeResult {
  if (trip.status !== "open" || !trip.card.active || trip.people.length === 0) {
    return { ok: false, reason: "inactive" };
  }

  const shares = equalShares(draft.cartCents, trip.people.length);
  const blocked = trip.people.some(
    (person, index) => !person.card.active || shares[index]! > person.card.remainingCents,
  );
  if (blocked) {
    return { ok: false, reason: "cap-exceeds-card" };
  }

  const collections: Collection[] = trip.people.map((person, index) => ({
    personId: person.id,
    name: person.name,
    last4: person.card.last4,
    amountCents: shares[index]!,
  }));

  const next: Trip = {
    ...trip,
    people: trip.people.map((person, index) => ({
      ...person,
      card: {
        ...person.card,
        remainingCents: person.card.remainingCents - shares[index]!,
      },
    })),
    charges: [
      ...trip.charges,
      {
        id: `charge-${trip.charges.length + 1}`,
        merchant: draft.merchant,
        amountCents: draft.cartCents,
        collections,
      },
    ],
  };

  return { ok: true, trip: next, collections };
}

export function closeTrip(trip: Trip): Trip {
  return {
    ...trip,
    status: "closed",
    card: { ...trip.card, active: false },
    people: trip.people.map((person) => ({
      ...person,
      card: { ...person.card, active: false },
    })),
  };
}

function samplePerson(id: string, name: string, last4: string, kind: CardKind): Person {
  return {
    id,
    name,
    card: {
      kind,
      last4,
      limitCents: 13_000,
      remainingCents: 13_000,
      exp: "09/28",
      active: true,
    },
  };
}

/** Five people, five cards, $130 each, under one trip card. */
export function initialAustin(): Trip {
  return {
    id: "austin",
    name: "Austin",
    dates: "Nov 14–17",
    place: "Austin",
    budgetCents: 65_000,
    status: "open",
    card: { name: "Trip card", kind: "debit", last4: "7714", exp: "09/28", active: true },
    charges: [],
    people: [
      samplePerson("person-1", "Jordan", "4242", "debit"),
      samplePerson("person-2", "Alex", "8188", "credit"),
      samplePerson("person-3", "Sam", "1111", "debit"),
      samplePerson("person-4", "Riya", "2222", "credit"),
      samplePerson("person-5", "Kabir", "3333", "debit"),
    ],
    photos: [],
  };
}

/** The open Austin sample, after the hotel and the DoorDash cart. */
export function austinSample(): Trip {
  const hotel = chargeTrip(initialAustin(), {
    merchant: "The Line Hotel",
    cartCents: 18_000,
  });
  if (!hotel.ok) {
    throw new Error("Sample hotel charge was declined.");
  }
  const food = chargeTrip(hotel.trip, {
    merchant: "DoorDash · Luna Thai",
    cartCents: 2_500,
  });
  if (!food.ok) {
    throw new Error("Sample DoorDash charge was declined.");
  }
  return food.trip;
}

function issueTripCard(now = new Date()): IssuedCard {
  const last4 = String((now.getTime() % 9000) + 1000).padStart(4, "0");
  return {
    name: "Trip card",
    kind: "debit",
    last4,
    exp: issueCard(now).exp,
    active: true,
  };
}

export function openTrip(input: NewTrip, ownerCard: RegisteredCard, now = new Date()): Trip {
  const ownerName = input.ownerName.trim() || "You";
  const owner: Person = {
    id: "person-1",
    name: ownerName,
    card: { ...ownerCard },
  };
  const friends = input.friends
    .map((friend, index) => ({
      id: `person-${index + 2}`,
      name: friend.name.trim(),
      card: { ...friend.card },
    }))
    .filter((person) => person.name)
    .slice(0, maxPeople - 1);
  const people = [owner, ...friends].slice(0, maxPeople);
  const budgetCents = people.reduce((sum, person) => sum + person.card.limitCents, 0);
  return {
    id: `trip-${now.getTime()}`,
    name: input.name.trim(),
    dates: "",
    place: input.name.trim(),
    budgetCents,
    status: "open",
    card: issueTripCard(now),
    charges: [],
    people,
    photos: [],
  };
}

export function invitePerson(trip: Trip, name: string, card: RegisteredCard): Trip {
  const trimmed = name.trim();
  if (!trimmed) return trip;
  if (trip.people.length >= maxPeople) return trip;
  if (trip.people.some((person) => person.name.toLowerCase() === trimmed.toLowerCase())) {
    return trip;
  }
  return {
    ...trip,
    budgetCents: trip.budgetCents + card.limitCents,
    people: [
      ...trip.people,
      {
        id: `person-${trip.people.length + 1}`,
        name: trimmed,
        card: { ...card },
      },
    ],
  };
}

export function startTrip(
  current: Trip | null,
  input: NewTrip,
  ownerCard: RegisteredCard,
): { ok: true; trip: Trip } | { ok: false; reason: "trip-open" } {
  if (current?.status === "open") {
    return { ok: false, reason: "trip-open" };
  }
  return { ok: true, trip: openTrip(input, ownerCard) };
}
