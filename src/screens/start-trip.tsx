import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  cardLabel,
  makeRegisteredCard,
  masked,
  maxFriends,
  parseCents,
  parseLast4,
  type CardKind,
  type TripFriend,
} from "@/ledger";
import { colors, Field, Header, KindToggle, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { FaceRow } from "@/components/trip-extras";
import { useTrip } from "@/store";

export function StartTripScreen() {
  const { start, user } = useTrip();
  const [name, setName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [kind, setKind] = useState<CardKind>("debit");
  const [last4, setLast4] = useState("");
  const [limit, setLimit] = useState("");
  const [friends, setFriends] = useState<TripFriend[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const ownerName = user?.name ?? "You";
  const slotsLeft = maxFriends - friends.length;

  function addFriend() {
    const nextName = friendName.trim();
    const digits = parseLast4(last4);
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
      setMessage("Enter the last four digits.");
      return;
    }
    if (limitCents == null || limitCents <= 0) {
      setMessage("Enter the amount on their card.");
      return;
    }
    setFriends([...friends, { name: nextName, card: makeRegisteredCard(kind, digits, limitCents) }]);
    setFriendName("");
    setLast4("");
    setLimit("");
    setKind("debit");
    setMessage(null);
  }

  function save() {
    const tripName = name.trim();
    if (!tripName) {
      setMessage("Enter a trip name.");
      return;
    }
    const ok = start(tripName, friends);
    if (!ok) return;
    router.replace("/trip");
  }

  const faces = [
    { id: "you", name: ownerName, card: user?.card ?? makeRegisteredCard("debit", "0000", 0) },
    ...friends.map((friend, index) => ({ id: `draft-${index}`, name: friend.name, card: friend.card })),
  ];

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Start a trip</Title>
          <Muted>Your card is already on it. Add up to five friends with their cards. Spend splits equally.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Open trip" testID="open-trip" onPress={save} />}
    >
      <Field label="Trip" value={name} onChangeText={setName} testID="trip-name" />
      <Text style={styles.section}>On this trip card</Text>
      <FaceRow people={faces} />
      {user?.card ? (
        <View style={styles.person}>
          <Text style={styles.personName}>{ownerName} · you</Text>
          <Text style={styles.personMeta}>
            {cardLabel(user.card.kind)} {masked(user.card.last4)}
          </Text>
        </View>
      ) : null}
      {friends.map((friend, index) => (
        <View key={`${friend.name}-${index}`} style={styles.person}>
          <Text style={styles.personName}>{friend.name}</Text>
          <Text style={styles.personMeta}>
            {cardLabel(friend.card.kind)} {masked(friend.card.last4)}
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
          <Field label="Last four" value={last4} onChangeText={setLast4} keyboardType="number-pad" testID="friend-last4" />
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
  section: {
    marginTop: 22,
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
