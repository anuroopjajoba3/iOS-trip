import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, leftCents, masked, type Trip } from "@/ledger";
import { colors, Muted, PrimaryButton, SampleLine, Screen, Title, WalletStack } from "@/components/ui";
import { useTrip } from "@/store";

export function TripsScreen() {
  const { trip, notice, start } = useTrip();
  const open = trip?.status === "open";

  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>Trips</Title>
          {trip ? <Muted>{trip.dates}</Muted> : <Muted>One PaySplit card. Two funding cards.</Muted>}
          {notice ? <Muted>{notice}</Muted> : null}
        </View>
      }
      footer={
        open ? undefined : (
          <PrimaryButton label="Start a trip" onPress={start} testID="start-trip" />
        )
      }
    >
      {!trip ? (
        <View>
          <Text style={styles.body}>A wallet for one trip.</Text>
          <SampleLine />
        </View>
      ) : (
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${trip.name}, ${trip.dates}, ${formatDollars(leftCents(trip))} ${open ? "left" : "settled"}, PaySplit card ${open ? "active" : "inactive"}`}
            testID="trip-row"
            onPress={() => router.push(open ? "/trip" : "/closed")}
          >
            <TripStack trip={trip} />
          </Pressable>
          <Muted>{open ? "PaySplit card active" : "PaySplit card inactive"}</Muted>
          <SampleLine />
        </View>
      )}
    </Screen>
  );
}

export function TripStack({ trip }: { trip: Trip }) {
  const open = trip.status === "open";
  const [visa, mastercard] = trip.funding;
  const status = open ? "Active" : "Inactive";
  return (
    <WalletStack
      cards={[
        {
          tone: "paysplit",
          label: "PaySplit",
          title: masked(trip.paySplit.last4),
          detail: `exp ${trip.paySplit.exp}`,
          amount: `${formatDollars(leftCents(trip))} left`,
          status,
          active: open,
        },
        {
          tone: "visa",
          label: visa.name,
          title: masked(visa.last4),
          detail: `Cap ${formatDollars(visa.capCents)}`,
          amount: `${formatDollars(visa.remainingCents)} left`,
          status,
          active: open && visa.active,
        },
        {
          tone: "mastercard",
          label: mastercard.name,
          title: masked(mastercard.last4),
          detail: `Cap ${formatDollars(mastercard.capCents)}`,
          amount: `${formatDollars(mastercard.remainingCents)} left`,
          status,
          active: open && mastercard.active,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
});
