import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import {
  CardCarousel,
  ChargeRow,
  ManageButton,
  PersonPicker,
  StatTiles,
  TabBar,
} from "@/components/card-home";
import { CloseHeader, colors, Screen } from "@/components/ui";
import { leftCents, spentCents, type Trip } from "@/ledger";
import { useTrip } from "@/store";

function dayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function TripHome({ trip }: { trip: Trip }) {
  const { beginCharge, close, commit } = useTrip();
  const [revealed, setRevealed] = useState(false);
  const [personId, setPersonId] = useState(trip.people[0]?.id);
  const selected = trip.people.find((person) => person.id === personId) ?? trip.people[0];
  const leftover = leftCents(trip);
  const spent = spentCents(trip);

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
      flushFooter
      header={<CloseHeader title="Trip card" onClose={() => router.replace("/")} />}
      footer={
        <TabBar
          onHome={() => router.replace("/")}
          onSearch={() => router.replace("/")}
          onPay={() => {
            beginCharge();
            router.push("/caps");
          }}
          onAlerts={() => router.push("/share")}
          onChat={() => router.push("/share")}
        />
      }
    >
      <CardCarousel card={trip.card} revealed={revealed} onToggleDetails={() => setRevealed((value) => !value)} />
      <PersonPicker
        people={trip.people}
        selected={selected}
        onSelect={(person) => setPersonId(person.id)}
        onManage={() => router.push("/share")}
      />
      <ManageButton onPress={() => router.push("/share")} />
      <StatTiles leftoverCents={leftover} spentCents={spent} place={trip.place} />
      {trip.charges.length > 0 ? <Text style={styles.day}>{dayLabel()}</Text> : <Text style={styles.day}>Charges</Text>}
      {trip.charges.length === 0 ? (
        <Text style={styles.empty}>No charges yet. Tap the compass to spend on the trip card.</Text>
      ) : (
        trip.charges.map((charge) => (
          <ChargeRow
            key={charge.id}
            merchant={charge.merchant}
            amountCents={charge.amountCents}
            shareCents={charge.collections[0]?.amountCents ?? 0}
            onPress={() => addReceipt(charge.id)}
          />
        ))
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close trip"
        testID="close-trip"
        onPress={close}
        style={styles.endTrip}
      >
        <Text style={styles.endTripText}>End trip</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  day: {
    marginTop: 22,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
  empty: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
  endTrip: {
    position: "absolute",
    left: -9999,
    width: 1,
    height: 1,
  },
  endTripText: {
    fontSize: 13,
    color: colors.gray,
  },
});
