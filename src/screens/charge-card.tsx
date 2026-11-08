import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, masked, type Draft, type Trip } from "@/ledger";
import { authCopy, colors, Header, SampleLine, Screen, Slab, Title, PrimaryButton } from "@/components/ui";

export function ChargeCardScreen({ trip, draft }: { trip: Trip; draft: Draft }) {
  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>{draft.merchant}</Title>
          <Text style={styles.support}>Full amount on one card</Text>
        </View>
      }
      footer={
        <PrimaryButton label="Charge" onPress={() => router.push("/result")} testID="charge" />
      }
    >
      <Slab
        tone="paysplit"
        label="PaySplit"
        title={masked(trip.paySplit.last4)}
        detail={`exp ${trip.paySplit.exp}`}
        amount={formatDollars(draft.cartCents)}
        status="Charge"
        active={trip.paySplit.active}
      />
      <Text style={styles.copy}>{authCopy}</Text>
      <SampleLine />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  support: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  copy: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
});
