import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { equalShares, formatDollars, formatPan, type Draft, type Trip } from "@/ledger";
import { authCopy, CardArrive, colors, Header, Screen, Slab, Title, PrimaryButton } from "@/components/ui";

export function ChargeCardScreen({ trip, draft }: { trip: Trip; draft: Draft }) {
  const shares = equalShares(draft.cartCents, trip.people.length);

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>{draft.merchant}</Title>
          <Text style={styles.support}>Shop charges this card. Everyone pays the same.</Text>
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
          title={formatPan(trip.card.pan)}
          detail={`exp ${trip.card.exp} · ${trip.card.inWallet ? "Apple Wallet" : "Apple Pay"}`}
          amount={formatDollars(draft.cartCents)}
          status="Pay"
          active={trip.card.active}
        />
      </CardArrive>
      <Text style={styles.section}>Charged equally</Text>
      {trip.people.map((person, index) => (
        <View key={person.id} style={styles.row}>
          <Text style={styles.name}>
            {person.name} {formatPan(person.card.pan)}
          </Text>
          <Text style={styles.amount}>{formatDollars(shares[index] ?? 0)}</Text>
        </View>
      ))}
      <Text style={styles.copy}>{authCopy}</Text>
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
  section: {
    marginTop: 22,
    marginBottom: 4,
    fontSize: 13,
    color: colors.gray,
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  amount: {
    fontSize: 16,
    color: colors.white,
  },
  copy: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
});
