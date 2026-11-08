import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { cardLabel, formatDollars, leftCents, masked, type Trip } from "@/ledger";
import { colors, Header, HeroMoney, PrimaryButton, RowEnter, Screen, Title } from "@/components/ui";
import { FaceRow, PhotoStrip, PlaceMap, SpentChart } from "@/components/trip-extras";
import { useTrip } from "@/store";
import { TripStack } from "@/screens/trips";

export function TripHome({ trip }: { trip: Trip }) {
  const { beginCharge, close, commit } = useTrip();

  async function addPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    commit({
      ...trip,
      photos: [...trip.photos, { id: `photo-${trip.photos.length + 1}`, uri: result.assets[0].uri }],
    });
  }

  async function addReceipt(chargeId: string) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    commit({
      ...trip,
      charges: trip.charges.map((charge) =>
        charge.id === chargeId ? { ...charge, receiptUri: result.assets[0].uri } : charge,
      ),
    });
  }

  return (
    <Screen
      header={
        <Header
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close trip"
              testID="close-trip"
              onPress={close}
              style={styles.close}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          }
        />
      }
      pinned={
        <View style={styles.pinned}>
          <Title>{trip.name}</Title>
          <Text style={styles.still}>STILL LEFT</Text>
          <HeroMoney>{formatDollars(leftCents(trip))}</HeroMoney>
        </View>
      }
      footer={
        <PrimaryButton
          label="New charge"
          testID="new-charge"
          onPress={() => {
            beginCharge();
            router.push("/caps");
          }}
        />
      }
    >
      <TripStack trip={trip} />
      <Text style={styles.section}>Under this card</Text>
      {trip.people.map((person) => (
        <View key={person.id} style={styles.person}>
          <View style={styles.personTop}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personLeft}>{formatDollars(person.card.remainingCents)}</Text>
          </View>
          <Text style={styles.metaLine}>
            {cardLabel(person.card.kind)} {masked(person.card.last4)}
          </Text>
        </View>
      ))}
      <FaceRow people={trip.people} onPress={() => router.push("/share")} />
      <SpentChart trip={trip} />
      <Text style={styles.section}>Charges</Text>
      {trip.charges.map((charge, index) => (
        <RowEnter key={charge.id} index={index}>
          <View style={styles.charge}>
            <View style={styles.chargeTop}>
              <Text style={styles.merchant}>{charge.merchant}</Text>
              <Text style={styles.amount}>{formatDollars(charge.amountCents)}</Text>
            </View>
            <Text style={styles.metaLine}>
              {formatDollars(charge.amountCents)} charged on {trip.card.name} {masked(trip.card.last4)}
            </Text>
            {charge.collections.map((line) => (
              <Text key={line.personId} style={styles.metaLine}>
                {line.name} {masked(line.last4)} {formatDollars(line.amountCents)}
              </Text>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add receipt"
              onPress={() => addReceipt(charge.id)}
              style={styles.receipt}
            >
              <Text style={styles.receiptText}>{charge.receiptUri ? "Receipt saved" : "Add receipt"}</Text>
            </Pressable>
          </View>
        </RowEnter>
      ))}
      <PlaceMap place={trip.place} />
      <PhotoStrip photos={trip.photos} onAdd={addPhoto} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.gray,
  },
  pinned: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  still: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: colors.gray,
  },
  section: {
    marginTop: 18,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 16,
    color: colors.gray,
  },
  person: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  personTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  personName: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  personLeft: {
    fontSize: 16,
    color: colors.white,
  },
  charge: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  chargeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  merchant: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.white,
  },
  amount: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.white,
  },
  metaLine: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
  receipt: {
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  receiptText: {
    fontSize: 14,
    color: colors.gray,
  },
});
