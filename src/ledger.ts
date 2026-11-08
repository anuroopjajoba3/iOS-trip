/**
 * One Trip card takes the merchant authorization for the full cart.
 * Two funding caps must sum to that cart in exact cents, or the cart is declined.
 * A cap larger than what is left on that card declines the cart too.
 */

export type FundingCard = {
  id: "visa" | "mastercard";
  name: string;
  last4: string;
  capCents: number;
  remainingCents: number;
  active: boolean;
};

export type Collection = {
  cardId: FundingCard["id"];
  name: string;
  last4: string;
  amountCents: number;
};

export type Charge = {
  id: string;
  merchant: string;
  amountCents: number;
  collections: [Collection, Collection];
  receiptUri?: string;
};

export type Person = {
  id: string;
  name: string;
};

export type Photo = {
  id: string;
  uri: string;
};

export type IssuedCard = {
  name: string;
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
  funding: [FundingCard, FundingCard];
  card: IssuedCard;
  charges: Charge[];
  people: Person[];
  photos: Photo[];
};

export type Draft = {
  merchant: string;
  cartCents: number;
  visaCents: number;
  mastercardCents: number;
};

export type DeclineReason = "caps-do-not-cover" | "cap-exceeds-card" | "inactive";

export type ChargeResult =
  | { ok: true; trip: Trip; collections: [Collection, Collection] }
  | { ok: false; reason: DeclineReason };

export function spentCents(trip: Trip): number {
  return trip.charges.reduce((sum, charge) => sum + charge.amountCents, 0);
}

export function leftCents(trip: Trip): number {
  return trip.budgetCents - spentCents(trip);
}

export function declineCopy(reason: Exclude<DeclineReason, "inactive">): string {
  if (reason === "caps-do-not-cover") {
    return "Caps do not cover the cart.";
  }
  return "A cap is larger than what is left on that card.";
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

/** Exact cents. Empty is missing. Zero is a real cap. More than two decimals is rejected. */
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

/**
 * Two caps that sum to the cart approve.
 * Any other sum declines the whole cart.
 * A cap larger than what is left on that card declines the whole cart.
 */
export function chargeTrip(trip: Trip, draft: Draft): ChargeResult {
  if (trip.status !== "open" || !trip.card.active) {
    return { ok: false, reason: "inactive" };
  }

  const { cartCents, visaCents, mastercardCents } = draft;
  if (visaCents + mastercardCents !== cartCents) {
    return { ok: false, reason: "caps-do-not-cover" };
  }

  const [visa, mastercard] = trip.funding;
  if (visaCents > visa.remainingCents || mastercardCents > mastercard.remainingCents) {
    return { ok: false, reason: "cap-exceeds-card" };
  }

  const collections: [Collection, Collection] = [
    { cardId: visa.id, name: visa.name, last4: visa.last4, amountCents: visaCents },
    {
      cardId: mastercard.id,
      name: mastercard.name,
      last4: mastercard.last4,
      amountCents: mastercardCents,
    },
  ];

  const next: Trip = {
    ...trip,
    funding: [
      { ...visa, remainingCents: visa.remainingCents - visaCents },
      { ...mastercard, remainingCents: mastercard.remainingCents - mastercardCents },
    ],
    charges: [
      ...trip.charges,
      {
        id: `charge-${trip.charges.length + 1}`,
        merchant: draft.merchant,
        amountCents: cartCents,
        collections,
      },
    ],
  };

  return { ok: true, trip: next, collections };
}

export function closeTrip(trip: Trip): Trip {
  const [visa, mastercard] = trip.funding;
  return {
    ...trip,
    status: "closed",
    card: { ...trip.card, active: false },
    funding: [
      { ...visa, active: false },
      { ...mastercard, active: false },
    ],
  };
}

export function initialAustin(): Trip {
  return {
    id: "austin",
    name: "Austin",
    dates: "Nov 14–17",
    place: "Austin",
    budgetCents: 65_000,
    status: "open",
    funding: [
      {
        id: "visa",
        name: "Everyday Visa",
        last4: "4242",
        capCents: 40_000,
        remainingCents: 40_000,
        active: true,
      },
      {
        id: "mastercard",
        name: "World Mastercard",
        last4: "8188",
        capCents: 25_000,
        remainingCents: 25_000,
        active: true,
      },
    ],
    card: { name: "Trip card", last4: "7714", exp: "09/28", active: true },
    charges: [],
    people: [],
    photos: [],
  };
}

/** The open Austin sample, after the hotel and the DoorDash cart. */
export function austinSample(): Trip {
  const hotel = chargeTrip(initialAustin(), {
    merchant: "The Line Hotel",
    cartCents: 18_000,
    visaCents: 11_000,
    mastercardCents: 7_000,
  });
  if (!hotel.ok) {
    throw new Error("Sample hotel charge was declined.");
  }
  const food = chargeTrip(hotel.trip, {
    merchant: "DoorDash · Luna Thai",
    cartCents: 2_500,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });
  if (!food.ok) {
    throw new Error("Sample DoorDash charge was declined.");
  }
  return food.trip;
}

export type NewTrip = {
  name: string;
  dates: string;
  place: string;
  cardName: string;
  visaName: string;
  visaLast4: string;
  visaCapCents: number;
  mastercardName: string;
  mastercardLast4: string;
  mastercardCapCents: number;
};

export function parseLast4(value: string): string | null {
  const digits = value.trim();
  if (!/^\d{4}$/.test(digits)) {
    return null;
  }
  return digits;
}

export function issueCard(now = new Date()): { last4: string; exp: string } {
  const last4 = String(now.getTime() % 10_000).padStart(4, "0");
  const expDate = new Date(now);
  expDate.setFullYear(expDate.getFullYear() + 2);
  const month = String(expDate.getMonth() + 1).padStart(2, "0");
  const year = String(expDate.getFullYear()).slice(-2);
  return { last4, exp: `${month}/${year}` };
}

export function evenSplit(cartCents: number): { visaCents: number; mastercardCents: number } {
  const visaCents = Math.ceil(cartCents / 2);
  return { visaCents, mastercardCents: cartCents - visaCents };
}

export function openTrip(input: NewTrip, now = new Date()): Trip {
  const issued = issueCard(now);
  return {
    id: `trip-${now.getTime()}`,
    name: input.name.trim(),
    dates: input.dates.trim(),
    place: input.place.trim() || input.name.trim(),
    budgetCents: input.visaCapCents + input.mastercardCapCents,
    status: "open",
    funding: [
      {
        id: "visa",
        name: input.visaName.trim() || "Visa",
        last4: input.visaLast4,
        capCents: input.visaCapCents,
        remainingCents: input.visaCapCents,
        active: true,
      },
      {
        id: "mastercard",
        name: input.mastercardName.trim() || "Mastercard",
        last4: input.mastercardLast4,
        capCents: input.mastercardCapCents,
        remainingCents: input.mastercardCapCents,
        active: true,
      },
    ],
    card: { name: input.cardName.trim() || "Trip card", ...issued, active: true },
    charges: [],
    people: [],
    photos: [],
  };
}

export function invitePerson(trip: Trip, name: string): Trip {
  const trimmed = name.trim();
  if (!trimmed) return trip;
  if (trip.people.some((person) => person.name.toLowerCase() === trimmed.toLowerCase())) {
    return trip;
  }
  return {
    ...trip,
    people: [...trip.people, { id: `person-${trip.people.length + 1}`, name: trimmed }],
  };
}

export function startTrip(
  current: Trip | null,
  input: NewTrip,
): { ok: true; trip: Trip } | { ok: false; reason: "trip-open" } {
  if (current?.status === "open") {
    return { ok: false, reason: "trip-open" };
  }
  return { ok: true, trip: openTrip(input) };
}
