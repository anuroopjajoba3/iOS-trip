import assert from "node:assert/strict";
import test from "node:test";

import {
  austinSample,
  chargeTrip,
  closeTrip,
  declineCopy,
  formatDollars,
  initialAustin,
  leftCents,
  startTrip,
} from "./ledger";

test("15 + 10 approves a 25 cart and writes two collection lines", () => {
  const result = chargeTrip(initialAustin(), {
    merchant: "Cafe",
    cartCents: 2_500,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(
    result.collections.map((line) => [line.name, line.amountCents]),
    [
      ["Everyday Visa", 1_500],
      ["World Mastercard", 1_000],
    ],
  );
  assert.equal(result.trip.charges[0]?.amountCents, 2_500);
  assert.equal(result.trip.funding[0].remainingCents, 38_500);
  assert.equal(result.trip.funding[1].remainingCents, 24_000);
  assert.equal(leftCents(result.trip), 62_500);
  assert.equal(formatDollars(2_500), "$25.00");
});

test("15 + 10 against 26 declines the whole cart and collects nothing", () => {
  const trip = initialAustin();
  const result = chargeTrip(trip, {
    merchant: "Cafe",
    cartCents: 2_600,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });

  assert.deepEqual(result, { ok: false, reason: "caps-do-not-cover" });
  assert.equal(declineCopy("caps-do-not-cover"), "Caps do not cover the cart.");
  assert.equal(trip.charges.length, 0);
  assert.equal(trip.funding[0].remainingCents, 40_000);
  assert.equal(trip.funding[1].remainingCents, 25_000);
  assert.equal(leftCents(trip), 65_000);

  const over = chargeTrip(trip, {
    merchant: "Cafe",
    cartCents: 2_500,
    visaCents: 2_000,
    mastercardCents: 1_000,
  });
  assert.equal(over.ok, false);
  if (!over.ok) assert.equal(over.reason, "caps-do-not-cover");
});

test("a cap larger than what is left on that card declines the whole cart", () => {
  const trip = initialAustin();
  const result = chargeTrip(trip, {
    merchant: "Shop",
    cartCents: 25_001,
    visaCents: 0,
    mastercardCents: 25_001,
  });

  assert.deepEqual(result, { ok: false, reason: "cap-exceeds-card" });
  assert.equal(
    declineCopy("cap-exceeds-card"),
    "A cap is larger than what is left on that card.",
  );
  assert.equal(trip.charges.length, 0);
  assert.equal(trip.funding[0].remainingCents, 40_000);
  assert.equal(trip.funding[1].remainingCents, 25_000);

  const exact = chargeTrip(trip, {
    merchant: "Shop",
    cartCents: 25_000,
    visaCents: 0,
    mastercardCents: 25_000,
  });
  assert.equal(exact.ok, true);
});

test("Austin hotel then DoorDash approve, and a later mismatch collects nothing", () => {
  const hotel = chargeTrip(initialAustin(), {
    merchant: "The Line Hotel",
    cartCents: 18_000,
    visaCents: 11_000,
    mastercardCents: 7_000,
  });
  assert.equal(hotel.ok, true);
  if (!hotel.ok) return;

  assert.equal(hotel.trip.funding[0].remainingCents, 29_000);
  assert.equal(hotel.trip.funding[1].remainingCents, 18_000);
  assert.equal(leftCents(hotel.trip), 47_000);
  assert.equal(hotel.trip.charges.length, 1);
  assert.equal(hotel.trip.charges[0]?.amountCents, 18_000);

  const food = chargeTrip(hotel.trip, {
    merchant: "DoorDash · Luna Thai",
    cartCents: 2_500,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });
  assert.equal(food.ok, true);
  if (!food.ok) return;

  assert.equal(food.trip.funding[0].remainingCents, 27_500);
  assert.equal(food.trip.funding[1].remainingCents, 17_000);
  assert.equal(leftCents(food.trip), 44_500);
  assert.equal(food.trip.card.active, true);
  assert.equal(food.trip.card.last4, "7714");
  assert.equal(food.trip.card.exp, "09/28");
  assert.equal(food.trip.card.name, "Trip card");

  const declined = chargeTrip(food.trip, {
    merchant: "Corner",
    cartCents: 2_600,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });
  assert.equal(declined.ok, false);
  assert.equal(food.trip.charges.length, 2);
  assert.equal(food.trip.funding[0].remainingCents, 27_500);
  assert.equal(leftCents(food.trip), 44_500);

  const sample = austinSample();
  assert.equal(sample.name, "Austin");
  assert.equal(sample.dates, "Nov 14–17");
  assert.equal(leftCents(sample), 44_500);
  assert.equal(sample.funding[0].remainingCents, 27_500);
  assert.equal(sample.funding[1].remainingCents, 17_000);
  assert.deepEqual(
    sample.charges.map((charge) => charge.merchant),
    ["The Line Hotel", "DoorDash · Luna Thai"],
  );
});

test("another trip is declined while one is open, and closing the trip settles the cards", () => {
  const open = austinSample();
  const nextTrip = { name: "Miami", friends: ["Alex"] };
  const card = {
    kind: "debit" as const,
    last4: "1111",
    limitCents: 30_000,
    remainingCents: 30_000,
    exp: "11/28",
    active: true,
  };
  assert.deepEqual(startTrip(open, nextTrip, card), { ok: false, reason: "trip-open" });

  const closed = closeTrip(open);
  assert.equal(closed.status, "closed");
  assert.equal(closed.card.active, false);
  assert.equal(closed.funding[0].active, false);
  assert.equal(closed.funding[1].active, false);
  assert.equal(closed.funding[0].remainingCents, open.funding[0].remainingCents);
  assert.equal(closed.funding[1].remainingCents, open.funding[1].remainingCents);
  assert.equal(leftCents(closed), leftCents(open));

  const afterClose = chargeTrip(closed, {
    merchant: "Cafe",
    cartCents: 2_500,
    visaCents: 1_500,
    mastercardCents: 1_000,
  });
  assert.deepEqual(afterClose, { ok: false, reason: "inactive" });
  assert.equal(closed.charges.length, open.charges.length);

  const restarted = startTrip(closed, nextTrip, card);
  assert.equal(restarted.ok, true);
  if (!restarted.ok) return;
  assert.equal(restarted.trip.status, "open");
  assert.equal(restarted.trip.card.active, true);
  assert.equal(restarted.trip.card.name, "Debit");
  assert.equal(restarted.trip.card.last4, "1111");
  assert.equal(restarted.trip.name, "Miami");
  assert.equal(restarted.trip.people[0]?.name, "Alex");
  assert.equal(restarted.trip.charges.length, 0);
  assert.equal(restarted.trip.budgetCents, 30_000);

  assert.equal(startTrip(null, nextTrip, card).ok, true);
});
