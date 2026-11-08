import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, leftCents, masked, type Trip } from "@/ledger";
import { colors, Muted, PrimaryButton, Screen, Title, WalletStack } from "@/components/ui";
import { useTrip } from "@/store";

export function TripsScreen() {
  const { trip, notice, user, logOut } = useTrip();
  const open = trip?.status === "open";

  return (
    <Screen
      header={
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            testID="log-out"
            onPress={logOut}
            style={styles.logOut}
          >
            <Text style={styles.logOutText}>Log out</Text>
          </Pressable>
        </View>
      }
      pinned={
        <View style={styles.pad}>
          <Title>Trips</Title>
          <Muted>{user ? user.name : "Your trips"}</Muted>
          {notice ? <Muted>{notice}</Muted> : null}
        </View>
      }
      footer={
        open ? undefined : (
          <PrimaryButton
            label="Start a trip"
            onPress={() => router.push("/start")}
            testID="start-trip"
          />
        )
      }
    >
      {!trip ? (
        <View>
          <Text style={styles.body}>Start a trip when you are ready. Nothing is preloaded.</Text>
        </View>
      ) : (
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${trip.name}, ${trip.dates}, ${formatDollars(leftCents(trip))} ${open ? "left" : "settled"}, ${trip.card.name} ${open ? "active" : "inactive"}`}
            testID="trip-row"
            onPress={() => router.push(open ? "/trip" : "/closed")}
          >
            <TripStack trip={trip} />
          </Pressable>
          <Muted>{open ? `${trip.card.name} active` : `${trip.card.name} inactive`}</Muted>
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
          tone: "trip",
          label: trip.card.name,
          title: masked(trip.card.last4),
          detail: `exp ${trip.card.exp}`,
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
  header: {
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    minWidth: 44,
    minHeight: 44,
  },
  logOut: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  logOutText: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.gray,
  },
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
});
