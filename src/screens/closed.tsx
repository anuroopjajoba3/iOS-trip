import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, leftCents, masked, type Trip } from "@/ledger";
import {
  colors,
  Money,
  PaySplitCard,
  PrimaryButton,
  SampleLine,
  Screen,
  Title,
} from "@/components/ui";

export function ClosedScreen({ trip }: { trip: Trip }) {
  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>{trip.name}</Title>
          <Text style={styles.dates}>{trip.dates}</Text>
          <Text style={styles.settled}>Settled</Text>
          <View style={styles.money}>
            <Money amount={formatDollars(leftCents(trip))} caption="still left" />
          </View>
          <PaySplitCard card={trip.paySplit} />
        </View>
      }
      footer={
        <PrimaryButton label="Done" testID="done" onPress={() => router.dismissTo("/")} />
      }
    >
      <Text style={styles.section}>Cards</Text>
      {trip.funding.map((card) => (
        <View key={card.id} style={styles.row}>
          <Text style={styles.name}>
            {card.name} {masked(card.last4)}
          </Text>
          <Text style={styles.meta}>
            {formatDollars(card.remainingCents)} settled · Inactive
          </Text>
        </View>
      ))}
      <Text style={styles.section}>Charges</Text>
      {trip.charges.map((charge) => (
        <View key={charge.id} style={styles.charge}>
          <View style={styles.chargeTop}>
            <Text style={styles.name}>{charge.merchant}</Text>
            <Text style={styles.name}>{formatDollars(charge.amountCents)}</Text>
          </View>
          {charge.collections.map((line) => (
            <Text key={line.cardId} style={styles.meta}>
              {line.name} {formatDollars(line.amountCents)}
            </Text>
          ))}
        </View>
      ))}
      <Text style={styles.note}>The cards are inactive. This card cannot be charged again.</Text>
      <SampleLine />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  dates: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  settled: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  money: {
    marginTop: 4,
    marginBottom: 16,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  row: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  charge: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  chargeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  meta: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  note: {
    marginTop: 18,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
});
