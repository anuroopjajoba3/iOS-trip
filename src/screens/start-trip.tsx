import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { maxFriends } from "@/ledger";
import { colors, Field, Header, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { FaceRow } from "@/components/trip-extras";
import { useTrip } from "@/store";

export function StartTripScreen() {
  const { start } = useTrip();
  const [name, setName] = useState("");
  const [friend, setFriend] = useState("");
  const [friends, setFriends] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function addFriend() {
    const next = friend.trim();
    if (!next) {
      setMessage("Enter a name.");
      return;
    }
    if (friends.length >= maxFriends) {
      setMessage("Five friends on this card.");
      return;
    }
    if (friends.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setMessage("That friend is already on the card.");
      return;
    }
    setFriends([...friends, next]);
    setFriend("");
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

  const people = friends.map((item, index) => ({ id: `draft-${index}`, name: item }));

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Start a trip</Title>
          <Muted>A name, then up to five friends on your trip card.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Open trip" testID="open-trip" onPress={save} />}
    >
      <Field label="Trip" value={name} onChangeText={setName} />
      <Text style={styles.section}>Friends</Text>
      <FaceRow people={people} />
      {friends.length < maxFriends ? (
        <View style={styles.addRow}>
          <View style={styles.friendField}>
            <Field label="Name" value={friend} onChangeText={setFriend} />
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
      ) : (
        <Text style={styles.full}>Five friends on this card.</Text>
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
