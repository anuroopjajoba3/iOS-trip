import assert from "node:assert/strict";
import test from "node:test";

import {
  austinSample,
  chargeTrip,
  closeTrip,
  declineCopy,
  equalShares,
  formatDollars,
  initialAustin,
  invitePerson,
  leftCents,
  makeRegisteredCard,
  maxPeople,
  startTrip,
} from "./ledger";

test("equal shares cover the cart, leftover cents go first", () => {
  assert.deepEqual(equalShares(2_500, 5), [500, 500, 500, 500, 500]);
  assert.deepEqual(equalShares(1_001, 5), [201, 200, 200, 200, 200]);
  assert.deepEqual(equalShares(100, 1), [100]);
  assert.deepEqual(equalShares(100, 0), []);
});

test("a 25 cart on five cards takes 5 from each person", () => {
  const result = chargeTrip(initialAustin(), {
    merchant: "Cafe",
    cartCents: 2_500,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(
    result.collections.map((line) => [line.name, line.amountCents]),
    [
      ["Jordan", 500],
      ["Alex", 500],
      ["Sam", 500],
      ["Riya", 500],
      ["Kabir", 500],
    ],
  );
  assert.equal(result.trip.charges[0]?.amountCents, 2_500);
  for (const person of result.trip.people) {
    assert.equal(person.card.remainingCents, 12_500);
  }
  assert.equal(leftCents(result.trip), 62_500);
  assert.equal(formatDollars(2_500), "$25.00");
});

test("if one person cannot cover an equal share, nothing is collected", () => {
  const trip = initialAustin();
  trip.people[4] = {
    ...trip.people[4]!,
    card: { ...trip.people[4]!.card, remainingCents: 400 },
  };

  const result = chargeTrip(trip, {
    merchant: "Cafe",
    cartCents: 2_500,
  });

  assert.deepEqual(result, { ok: false, reason: "cap-exceeds-card" });
  assert.equal(declineCopy("cap-exceeds-card"), "Someone on the trip cannot cover an equal share.");
  assert.equal(trip.charges.length, 0);
  assert.equal(trip.people[0]?.card.remainingCents, 13_000);
  assert.equal(trip.people[4]?.card.remainingCents, 400);
  assert.equal(leftCents(trip), 52_400);
});

test("Austin hotel then DoorDash split equally, a later overage collects nothing", () => {
  const hotel = chargeTrip(initialAustin(), {
    merchant: "The Line Hotel",
    cartCents: 18_000,
  });
  assert.equal(hotel.ok, true);
  if (!hotel.ok) return;

  for (const person of hotel.trip.people) {
    assert.equal(person.card.remainingCents, 9_400);
  }
  assert.equal(leftCents(hotel.trip), 47_000);
  assert.equal(hotel.trip.charges.length, 1);
  assert.equal(hotel.trip.charges[0]?.amountCents, 18_000);
  assert.deepEqual(
    hotel.collections.map((line) => line.amountCents),
    [3_600, 3_600, 3_600, 3_600, 3_600],
  );

  const food = chargeTrip(hotel.trip, {
    merchant: "DoorDash · Luna Thai",
    cartCents: 2_500,
  });
  assert.equal(food.ok, true);
  if (!food.ok) return;

  for (const person of food.trip.people) {
    assert.equal(person.card.remainingCents, 8_900);
  }
  assert.equal(leftCents(food.trip), 44_500);
  assert.equal(food.trip.card.active, true);
  assert.equal(food.trip.card.last4, "7714");
  assert.equal(food.trip.card.name, "Trip card");
  assert.equal(food.trip.people.length, 5);

  const declined = chargeTrip(food.trip, {
    merchant: "Corner",
    cartCents: 50_000,
  });
  assert.equal(declined.ok, false);
  if (!declined.ok) assert.equal(declined.reason, "cap-exceeds-card");
  assert.equal(food.trip.charges.length, 2);
  assert.equal(food.trip.people[0]?.card.remainingCents, 8_900);
  assert.equal(leftCents(food.trip), 44_500);

  const sample = austinSample();
  assert.equal(sample.name, "Austin");
  assert.equal(sample.dates, "Nov 14–17");
  assert.equal(leftCents(sample), 44_500);
  assert.equal(sample.people.length, 5);
  assert.deepEqual(
    sample.charges.map((charge) => charge.merchant),
    ["The Line Hotel", "DoorDash · Luna Thai"],
  );
});

test("another trip is declined while one is open, and closing settles every card", () => {
  const open = austinSample();
  const card = makeRegisteredCard("debit", "1111", 30_000, new Date("2026-11-08"));
  const nextTrip = {
    name: "Miami",
    ownerName: "Jordan",
    friends: [{ name: "Alex", card: makeRegisteredCard("credit", "8188", 20_000, new Date("2026-11-08")) }],
  };
  assert.deepEqual(startTrip(open, nextTrip, card), { ok: false, reason: "trip-open" });

  const closed = closeTrip(open);
  assert.equal(closed.status, "closed");
  assert.equal(closed.card.active, false);
  for (const person of closed.people) {
    assert.equal(person.card.active, false);
    assert.equal(person.card.remainingCents, open.people.find((item) => item.id === person.id)?.card.remainingCents);
  }
  assert.equal(leftCents(closed), leftCents(open));

  const afterClose = chargeTrip(closed, {
    merchant: "Cafe",
    cartCents: 2_500,
  });
  assert.deepEqual(afterClose, { ok: false, reason: "inactive" });
  assert.equal(closed.charges.length, open.charges.length);

  const restarted = startTrip(closed, nextTrip, card);
  assert.equal(restarted.ok, true);
  if (!restarted.ok) return;
  assert.equal(restarted.trip.status, "open");
  assert.equal(restarted.trip.card.active, true);
  assert.equal(restarted.trip.card.name, "Trip card");
  assert.equal(restarted.trip.name, "Miami");
  assert.equal(restarted.trip.people[0]?.name, "Jordan");
  assert.equal(restarted.trip.people[1]?.name, "Alex");
  assert.equal(restarted.trip.people.length, 2);
  assert.equal(restarted.trip.charges.length, 0);
  assert.equal(restarted.trip.budgetCents, 50_000);

  assert.equal(startTrip(null, nextTrip, card).ok, true);
});

test("a trip holds at most five people, each with a card", () => {
  const card = makeRegisteredCard("debit", "1111", 10_000, new Date("2026-11-08"));
  const friends = ["Alex", "Sam", "Riya", "Kabir", "Extra"].map((name, index) => ({
    name,
    card: makeRegisteredCard("credit", `200${index}`, 10_000, new Date("2026-11-08")),
  }));
  const opened = startTrip(null, { name: "Goa", ownerName: "Jordan", friends }, card);
  assert.equal(opened.ok, true);
  if (!opened.ok) return;
  assert.equal(opened.trip.people.length, maxPeople);
  assert.deepEqual(
    opened.trip.people.map((person) => person.name),
    ["Jordan", "Alex", "Sam", "Riya", "Kabir"],
  );

  const extra = invitePerson(
    opened.trip,
    "Meera",
    makeRegisteredCard("debit", "5555", 10_000, new Date("2026-11-08")),
  );
  assert.equal(extra.people.length, maxPeople);
});
