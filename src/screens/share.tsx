import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { invitePerson } from "@/ledger";
import { colors, Field, Header, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { FaceRow } from "@/components/trip-extras";
import { useTrip } from "@/store";

export function ShareScreen() {
  const { trip, commit } = useTrip();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  if (!trip) return null;
  const openTrip = trip;

  function invite() {
    const next = invitePerson(openTrip, name);
    if (next.people.length === openTrip.people.length) {
      setMessage("Enter a name to invite.");
      return;
    }
    commit(next);
    setName("");
    setMessage(null);
  }

  async function share() {
    const going = openTrip.people.map((person) => person.name).join(", ") || "just you";
    try {
      await Share.share({
        message: `Join ${openTrip.name} (${openTrip.dates}) in ${openTrip.place}. ${going}.`,
      });
    } catch {
      setMessage("Sharing is unavailable on this device.");
    }
  }

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Sharing</Title>
          <Muted>{openTrip.name}</Muted>
        </View>
      }
      footer={<PrimaryButton label="Share" testID="share-trip" onPress={share} />}
    >
      <FaceRow people={openTrip.people} />
      <Field label="Invite" value={name} onChangeText={setName} />
      <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={invite} style={styles.add}>
        <Text style={styles.addText}>Add</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  add: {
    marginTop: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  addText: {
    fontSize: 16,
    color: colors.white,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: colors.white,
  },
});
