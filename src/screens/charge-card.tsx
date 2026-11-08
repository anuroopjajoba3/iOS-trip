import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, masked, type Draft, type Trip } from "@/ledger";
import { authCopy, CardArrive, colors, Header, Screen, Slab, Title, PrimaryButton } from "@/components/ui";

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
        <PrimaryButton label="Pay" onPress={() => router.push("/result")} testID="charge" />
      }
    >
      <CardArrive>
        <Slab
          tone="trip"
          label={trip.card.name}
          title={masked(trip.card.last4)}
          detail={`exp ${trip.card.exp} · Apple Pay`}
          amount={formatDollars(draft.cartCents)}
          status="Pay"
          active={trip.card.active}
        />
      </CardArrive>
      <Text style={styles.copy}>{authCopy}</Text>
      <Text style={styles.copy}>Pay with Apple Pay on the Trip card. Your Visa and Mastercard stay behind it.</Text>
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
