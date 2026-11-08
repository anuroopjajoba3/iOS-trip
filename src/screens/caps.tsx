import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { centsToInput, formatDollars, parseCents, type Draft, type Trip } from "@/ledger";
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

  function save() {
    const name = merchant.trim();
    if (!name || cartCents == null || cartCents <= 0) {
      setMessage("Enter the merchant and the amount.");
      return;
    }
    const next: Draft = {
      merchant: name,
      cartCents,
      visaCents: cartCents,
      mastercardCents: 0,
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
          <Muted>{`${formatDollars(trip.funding[0].remainingCents)} left on ${trip.card.name}`}</Muted>
        </View>
      }
      footer={<PrimaryButton label="Continue" onPress={save} testID="save-caps" />}
    >
      <Field label="Merchant" value={merchant} onChangeText={setMerchant} />
      <Field label="Amount" value={cart} onChangeText={setCart} keyboardType="decimal-pad" money />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
  },
});
