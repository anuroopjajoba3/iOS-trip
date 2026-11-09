import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import {
  cardLabel,
  invitePerson,
  formatPan,
  makeRegisteredCard,
  maxFriends,
  maxPeople,
  parseCents,
  parsePan,
  type CardKind,
} from "@/ledger";
import { colors, Field, Header, KindToggle, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { FaceRow } from "@/components/trip-extras";
import { useTrip } from "@/store";

export function ShareScreen() {
  const { trip, commit } = useTrip();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CardKind>("debit");
  const [pan, setPan] = useState("");
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  if (!trip) return null;
  const openTrip = trip;
  const full = openTrip.people.length >= maxPeople;

  function invite() {
    if (full) {
      setMessage("Five friends on this trip card.");
      return;
    }
    const digits = parsePan(pan);
    const limitCents = parseCents(limit);
    if (!name.trim()) {
      setMessage("Enter a name to invite.");
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
    const next = invitePerson(openTrip, name, makeRegisteredCard(kind, digits, limitCents));
    if (next.people.length === openTrip.people.length) {
      setMessage("That person is already on the card.");
      return;
    }
    commit(next);
    setName("");
    setPan("");
    setLimit("");
    setKind("debit");
    setMessage(null);
  }

  async function share() {
    const going = openTrip.people.map((person) => person.name).join(", ") || "just you";
    try {
      await Share.share({
        message: `Join ${openTrip.name}. ${going}. Spend splits equally on the trip card.`,
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
          <Muted>{`${openTrip.name} · you plus ${Math.max(openTrip.people.length - 1, 0)} of ${maxFriends} friends`}</Muted>
        </View>
      }
      footer={<PrimaryButton label="Share" testID="share-trip" onPress={share} />}
    >
      <FaceRow people={openTrip.people} />
      {openTrip.people.map((person) => (
        <View key={person.id} style={styles.person}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personMeta}>
            {cardLabel(person.card.kind)} {formatPan(person.card.pan)}
          </Text>
        </View>
      ))}
      {full ? (
        <Text style={styles.message}>Five friends on this trip card.</Text>
      ) : (
        <View>
          <Field label="Invite" value={name} onChangeText={setName} />
          <Text style={styles.label}>Their card</Text>
          <KindToggle kind={kind} onChange={setKind} />
          <Field
            label="Card number"
            value={pan}
            onChangeText={(value) => setPan(formatPan(value))}
            keyboardType="number-pad"
            maxLength={19}
          />
          <Field label="Limit" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" money />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add"
            testID="add-friend"
            onPress={invite}
            style={styles.add}
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </View>
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
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: colors.gray,
  },
  add: {
    marginTop: 16,
    width: 52,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.trip,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 28,
    lineHeight: 30,
    color: colors.cardInk,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: colors.white,
  },
});
