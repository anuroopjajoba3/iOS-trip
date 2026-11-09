import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  cardLabel,
  formatPan,
  makeRegisteredCard,
  maxFriends,
  parseCents,
  parsePan,
  type CardKind,
  type TripFriend,
} from "@/ledger";
import { StepHint } from "@/components/explain";
import { colors, Field, Header, KindToggle, Muted, PrimaryButton, Screen, Slab, Title } from "@/components/ui";
import { FaceRow } from "@/components/trip-extras";
import { useTrip } from "@/store";

export function StartTripScreen() {
  const { start, user } = useTrip();
  const [name, setName] = useState("");
  const [ownerKind, setOwnerKind] = useState<CardKind>("debit");
  const [ownerPan, setOwnerPan] = useState("");
  const [ownerLimit, setOwnerLimit] = useState("");
  const [friendName, setFriendName] = useState("");
  const [kind, setKind] = useState<CardKind>("debit");
  const [friendPan, setFriendPan] = useState("");
  const [limit, setLimit] = useState("");
  const [friends, setFriends] = useState<TripFriend[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const ownerName = user?.name ?? "You";
  const tripCard = user?.tripCard;
  const slotsLeft = maxFriends - friends.length;

  function addFriend() {
    const nextName = friendName.trim();
    const digits = parsePan(friendPan);
    const limitCents = parseCents(limit);
    if (!nextName) {
      setMessage("Enter a name.");
      return;
    }
    if (slotsLeft <= 0) {
      setMessage("Five friends on this trip card.");
      return;
    }
    if (nextName.toLowerCase() === ownerName.toLowerCase()) {
      setMessage("That person is already on the card.");
      return;
    }
    if (friends.some((item) => item.name.toLowerCase() === nextName.toLowerCase())) {
      setMessage("That person is already on the card.");
      return;
    }
    if (!digits) {
      setMessage("Enter their 16-digit card number.");
      return;
    }
    if (limitCents == null || limitCents <= 0) {
      setMessage("Enter the amount on their card.");
      return;
    }
    setFriends([...friends, { name: nextName, card: makeRegisteredCard(kind, digits, limitCents) }]);
    setFriendName("");
    setFriendPan("");
    setLimit("");
    setKind("debit");
    setMessage(null);
  }

  function save() {
    const tripName = name.trim();
    const digits = parsePan(ownerPan);
    const limitCents = parseCents(ownerLimit);
    if (!tripName) {
      setMessage("Enter a trip name.");
      return;
    }
    if (!digits) {
      setMessage("Enter your 16-digit card number.");
      return;
    }
    if (limitCents == null || limitCents <= 0) {
      setMessage("Enter the amount on your card.");
      return;
    }
    const ok = start(tripName, makeRegisteredCard(ownerKind, digits, limitCents), friends);
    if (!ok) return;
    router.replace("/trip");
  }

  const ownerPreview = parsePan(ownerPan)
    ? makeRegisteredCard(ownerKind, ownerPan, parseCents(ownerLimit) ?? 0)
    : null;
  const faces = [
    { id: "you", name: ownerName, card: ownerPreview ?? makeRegisteredCard("debit", "0000", 0) },
    ...friends.map((friend, index) => ({ id: `draft-${index}`, name: friend.name, card: friend.card })),
  ];

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Start a trip</Title>
          <StepHint>Step 3 of 3 · Put real cards under the trip card</StepHint>
          <Muted>Name the trip. Add your card. Tap + for friends. Spend splits equally.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Open trip" testID="open-trip" onPress={save} />}
    >
      <Field label="Trip" value={name} onChangeText={setName} testID="trip-name" />
      {tripCard ? (
        <View style={styles.issued}>
          <Slab
            tone="trip"
            label={tripCard.name}
            title={formatPan(tripCard.pan)}
            detail={`exp ${tripCard.exp}${tripCard.inWallet ? " · Apple Wallet" : ""}`}
            amount={tripCard.inWallet ? "Apple Wallet" : "Virtual"}
            status={tripCard.inWallet ? "Wallet" : "Ready"}
            active
          />
        </View>
      ) : null}
      <Text style={styles.section}>Your card under it</Text>
      <KindToggle kind={ownerKind} onChange={setOwnerKind} />
      <Field
        label="Card number"
        value={ownerPan}
        onChangeText={(value) => setOwnerPan(formatPan(value))}
        keyboardType="number-pad"
        testID="owner-pan"
        maxLength={19}
      />
      <Field
        label="Limit"
        value={ownerLimit}
        onChangeText={setOwnerLimit}
        keyboardType="decimal-pad"
        money
        testID="owner-limit"
      />
      <Text style={styles.section}>On this trip card</Text>
      <FaceRow people={faces} />
      {friends.map((friend, index) => (
        <View key={`${friend.name}-${index}`} style={styles.person}>
          <Text style={styles.personName}>{friend.name}</Text>
          <Text style={styles.personMeta}>
            {cardLabel(friend.card.kind)} {formatPan(friend.card.pan)}
          </Text>
        </View>
      ))}
      {slotsLeft > 0 ? (
        <View style={styles.addBlock}>
          <Text style={styles.section}>Add a friend</Text>
          <View style={styles.addRow}>
            <View style={styles.friendField}>
              <Field label="Name" value={friendName} onChangeText={setFriendName} testID="friend-name" />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add friend"
              testID="add-friend"
              onPress={addFriend}
              style={styles.plus}
            >
              <Text style={styles.plusMark}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>Their card</Text>
          <KindToggle kind={kind} onChange={setKind} />
          <Field
            label="Card number"
            value={friendPan}
            onChangeText={(value) => setFriendPan(formatPan(value))}
            keyboardType="number-pad"
            testID="friend-pan"
            maxLength={19}
          />
          <Field label="Limit" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" money testID="friend-limit" />
        </View>
      ) : (
        <Text style={styles.full}>Five friends on this trip card.</Text>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  issued: {
    marginTop: 18,
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontSize: 13,
    color: colors.gray,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: colors.gray,
  },
  person: {
    marginTop: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  personName: {
    fontSize: 16,
    color: colors.white,
  },
  personMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.gray,
  },
  addBlock: {
    paddingBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  friendField: {
    flex: 1,
  },
  plus: {
    width: 52,
    minHeight: 52,
    marginBottom: 2,
    borderRadius: 26,
    backgroundColor: colors.trip,
    alignItems: "center",
    justifyContent: "center",
  },
  plusMark: {
    fontSize: 28,
    lineHeight: 30,
    color: colors.ink,
  },
  full: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: colors.white,
  },
});
