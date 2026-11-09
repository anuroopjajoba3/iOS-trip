import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  chargeTrip,
  declineCopy,
  formatDollars,
  formatPan,
  type ChargeResult,
  type Draft,
  type Trip,
} from "@/ledger";
import {
  authCopy,
  colors,
  CardArrive,
  Header,
  PrimaryButton,
  Screen,
  Slab,
  Title,
  waitingCopy,
} from "@/components/ui";
import { useTrip } from "@/store";

export function ResultScreen({ trip, draft }: { trip: Trip; draft: Draft }) {
  const { commit } = useTrip();
  const applied = useRef(false);
  const [outcome, setOutcome] = useState<ChargeResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (applied.current) return;
      applied.current = true;
      const result = chargeTrip(trip, draft);
      if (result.ok) commit(result.trip);
      setOutcome(result);
    }, 1000);
    return () => clearTimeout(timer);
  }, [commit, draft, trip]);

  const waiting = outcome == null;
  const approved = outcome?.ok === true;
  const declined = outcome != null && !outcome.ok && outcome.reason !== "inactive";

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>{waiting ? draft.merchant : approved ? "Approved" : "Declined"}</Title>
        </View>
      }
      footer={
        waiting ? undefined : approved ? (
          <PrimaryButton
            label="Back to the trip"
            testID="result-action"
            onPress={() => router.dismissTo("/trip")}
          />
        ) : (
          <PrimaryButton
            label="Change amount"
            testID="result-action"
            onPress={() => router.dismissTo("/caps")}
          />
        )
      }
    >
      {waiting ? (
        <View testID="waiting">
          <CardArrive>
            <Slab
              tone="trip"
              label={trip.card.name}
              title={formatPan(trip.card.pan)}
              detail={draft.merchant}
              amount={formatDollars(draft.cartCents)}
              status="Splitting"
            />
          </CardArrive>
          <Text style={styles.copy}>{waitingCopy}</Text>
        </View>
      ) : null}
      {approved && outcome.ok ? (
        <View testID="approved">
          <Text style={styles.merchant}>{draft.merchant}</Text>
          <Text style={styles.amount}>{formatDollars(draft.cartCents)} charged</Text>
          <Text style={styles.copy}>{authCopy}</Text>
          <Text style={styles.section}>Collections</Text>
            {outcome.collections.map((line) => (
            <View key={line.personId} style={styles.collection}>
              <Text style={styles.collectionName}>
                {line.name} ····{line.last4}
              </Text>
              <Text style={styles.collectionAmount}>{formatDollars(line.amountCents)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {declined && outcome && !outcome.ok && outcome.reason !== "inactive" ? (
        <View testID="declined">
          <CardArrive>
            <Slab
              tone="trip"
              label={trip.card.name}
              title={formatPan(trip.card.pan)}
              detail={draft.merchant}
              amount="Nothing collected"
              status="Declined"
              active={false}
            />
          </CardArrive>
          <Text style={styles.copy}>{declineCopy(outcome.reason)}</Text>
          <Text style={styles.copy}>Nothing was collected.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  merchant: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colors.white,
  },
  amount: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  copy: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
  section: {
    marginTop: 22,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 16,
    color: colors.gray,
  },
  collection: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  collectionName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
  },
  collectionAmount: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
  },
});
