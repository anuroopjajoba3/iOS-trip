import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, leftCents, type Trip } from "@/ledger";
import { colors, Muted, PrimaryButton, SampleLine, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function TripsScreen() {
  const { trip, notice, start } = useTrip();
  const open = trip?.status === "open";

  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>Trips</Title>
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
          <Text style={styles.body}>A wallet for one trip. One PaySplit card. Two funding cards.</Text>
          <SampleLine />
        </View>
      ) : (
        <View>
          <TripRow trip={trip} />
          {open ? (
            <Muted>One trip at a time. Close it before starting another.</Muted>
          ) : (
            <Muted>This trip is settled. The cards are inactive.</Muted>
          )}
          <SampleLine />
        </View>
      )}
    </Screen>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const open = trip.status === "open";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${trip.name}, ${trip.dates}, ${formatDollars(leftCents(trip))} ${open ? "left" : "settled"}, PaySplit card ${open ? "active" : "inactive"}`}
      testID="trip-row"
      onPress={() => router.push(open ? "/trip" : "/closed")}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowText}>
        <Text style={styles.name}>{trip.name}</Text>
        <Text style={styles.dates}>{trip.dates}</Text>
        <Text style={styles.status}>PaySplit card {open ? "active" : "inactive"}</Text>
      </View>
      <Text style={styles.left}>
        {formatDollars(leftCents(trip))} {open ? "left" : "settled"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  row: {
    minHeight: 44,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: colors.ink,
  },
  dates: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  status: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  left: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
    textAlign: "right",
  },
});
