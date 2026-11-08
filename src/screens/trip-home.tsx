import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, masked, spentCents, type Trip } from "@/ledger";
import { colors, Header, Muted, PrimaryButton, RowEnter, SampleLine, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";
import { TripStack } from "@/screens/trips";

export function TripHome({ trip }: { trip: Trip }) {
  const { beginCharge, close } = useTrip();

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
          <Muted>{trip.dates}</Muted>
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
      <Text style={styles.meta}>
        Budget {formatDollars(trip.budgetCents)} · Spent {formatDollars(spentCents(trip))}
      </Text>
      <Text style={styles.section}>Charges</Text>
      {trip.charges.map((charge, index) => (
        <RowEnter key={charge.id} index={index}>
        <View style={styles.charge}>
          <View style={styles.chargeTop}>
            <Text style={styles.merchant}>{charge.merchant}</Text>
            <Text style={styles.amount}>{formatDollars(charge.amountCents)}</Text>
          </View>
          <Text style={styles.metaLine}>
            {formatDollars(charge.amountCents)} charged on PaySplit {masked(trip.paySplit.last4)}
          </Text>
          {charge.collections.map((line) => (
            <Text key={line.cardId} style={styles.metaLine}>
              {line.name} {masked(line.last4)} {formatDollars(line.amountCents)}
            </Text>
          ))}
        </View>
        </RowEnter>
      ))}
      <SampleLine />
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
  meta: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
  section: {
    marginTop: 18,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 16,
    color: colors.gray,
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
});
