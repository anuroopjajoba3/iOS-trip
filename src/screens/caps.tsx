import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { centsToInput, equalShares, formatDollars, parseCents, type Draft, type Trip } from "@/ledger";
import { colors, Field, Header, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function CapsScreen({ trip }: { trip: Trip }) {
  const { draft, saveCaps } = useTrip();
  const [merchant, setMerchant] = useState(draft?.merchant ?? "");
  const [cart, setCart] = useState(draft ? centsToInput(draft.cartCents) : "");
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setMerchant(draft?.merchant ?? "");
      setCart(draft ? centsToInput(draft.cartCents) : "");
    }, [draft]),
  );

  const cartCents = parseCents(cart);
  const shares = cartCents != null && trip.people.length > 0 ? equalShares(cartCents, trip.people.length) : [];

  function save() {
    const name = merchant.trim();
    if (!name || cartCents == null || cartCents <= 0) {
      setMessage("Enter the merchant and the amount.");
      return;
    }
    const next: Draft = {
      merchant: name,
      cartCents,
    };
    saveCaps(next);
    router.push("/card");
  }

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>New charge</Title>
          <Muted>{`The trip card takes the full amount. Then it splits equally across ${trip.people.length} people.`}</Muted>
        </View>
      }
      footer={<PrimaryButton label="Continue" onPress={save} testID="save-caps" />}
    >
      <Field label="Merchant" value={merchant} onChangeText={setMerchant} testID="merchant" />
      <Field label="Amount" value={cart} onChangeText={setCart} keyboardType="decimal-pad" money testID="amount" />
      {shares.length > 0 ? (
        <View style={styles.preview}>
          <Text style={styles.section}>Equal split</Text>
          {trip.people.map((person, index) => (
            <View key={person.id} style={styles.row}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.amount}>{formatDollars(shares[index] ?? 0)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  preview: {
    marginTop: 22,
  },
  section: {
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
  message: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
  },
});
