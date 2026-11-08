import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatDollars, leftCents, masked, spentCents, type Trip } from "@/ledger";
import {
  colors,
  Header,
  Money,
  PaySplitCard,
  PrimaryButton,
  SampleLine,
  Screen,
  Title,
} from "@/components/ui";
import { useTrip } from "@/store";

export function TripHome({ trip }: { trip: Trip }) {
  const { beginCharge, close } = useTrip();
  const [visa, mastercard] = trip.funding;

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
          <Text style={styles.dates}>{trip.dates}</Text>
          <View style={styles.money}>
            <Money amount={formatDollars(leftCents(trip))} caption="still left" />
          </View>
          <PaySplitCard card={trip.paySplit} />
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
      <Text style={styles.line}>Budget {formatDollars(trip.budgetCents)}</Text>
      <Text style={styles.line}>Spent {formatDollars(spentCents(trip))}</Text>
      <Text style={styles.section}>Left on each card</Text>
      <FundingRow
        name={visa.name}
        last4={visa.last4}
        cap={visa.capCents}
        remaining={visa.remainingCents}
      />
      <FundingRow
        name={mastercard.name}
        last4={mastercard.last4}
        cap={mastercard.capCents}
        remaining={mastercard.remainingCents}
        last
      />
      <Text style={styles.section}>Charges</Text>
      {trip.charges.map((charge, index) => (
        <View
          key={charge.id}
          style={[styles.charge, index === trip.charges.length - 1 && styles.chargeLast]}
        >
          <View style={styles.chargeTop}>
            <Text style={styles.merchant}>{charge.merchant}</Text>
            <Text style={styles.amount}>{formatDollars(charge.amountCents)}</Text>
          </View>
          <Text style={styles.meta}>
            {formatDollars(charge.amountCents)} charged on PaySplit {masked(trip.paySplit.last4)}
          </Text>
          {charge.collections.map((line) => (
            <Text key={line.cardId} style={styles.meta}>
              {line.name} {masked(line.last4)} {formatDollars(line.amountCents)}
            </Text>
          ))}
        </View>
      ))}
      <SampleLine />
    </Screen>
  );
}

function FundingRow({
  name,
  last4,
  cap,
  remaining,
  last = false,
}: {
  name: string;
  last4: string;
  cap: number;
  remaining: number;
  last?: boolean;
}) {
  return (
    <View style={[styles.funding, !last && styles.fundingLine]}>
      <Text style={styles.merchant}>
        {name} {masked(last4)}
      </Text>
      <Text style={styles.meta}>
        Cap {formatDollars(cap)} · Left {formatDollars(remaining)}
      </Text>
    </View>
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
    fontSize: 17,
    lineHeight: 22,
    color: colors.accent,
  },
  pinned: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  dates: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  money: {
    marginBottom: 16,
  },
  line: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  funding: {
    minHeight: 44,
    paddingVertical: 10,
    justifyContent: "center",
  },
  fundingLine: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  charge: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  chargeLast: {
    borderBottomWidth: 0,
  },
  chargeTop: {
    minHeight: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  merchant: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  amount: {
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
});
