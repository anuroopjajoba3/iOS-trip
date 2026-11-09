import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, type Trip } from "@/ledger";
import { colors, Muted, PrimaryButton, RowEnter, SampleLine, Screen, Title } from "@/components/ui";
import { TripStack } from "@/screens/trips";

export function ClosedScreen({ trip }: { trip: Trip }) {
  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>{trip.name}</Title>
          <Muted>{`${trip.dates} · Settled`}</Muted>
        </View>
      }
      footer={
        <PrimaryButton label="Done" testID="done" onPress={() => router.dismissTo("/")} />
      }
    >
      <TripStack trip={trip} />
      <Text style={styles.note}>The trip card and every person's card are inactive. Nothing can be charged again.</Text>
      <Text style={styles.section}>Charges</Text>
      {trip.charges.map((charge, index) => (
        <RowEnter key={charge.id} index={index}>
        <View style={styles.charge}>
          <View style={styles.chargeTop}>
            <Text style={styles.name}>{charge.merchant}</Text>
            <Text style={styles.name}>{formatDollars(charge.amountCents)}</Text>
          </View>
          {charge.collections.map((line) => (
            <Text key={line.personId} style={styles.meta}>
              {line.name} ····{line.last4} {formatDollars(line.amountCents)}
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
  pad: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
  },
  note: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
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
  name: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
  },
  meta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
});
