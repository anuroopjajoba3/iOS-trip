import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  centsToInput,
  formatDollars,
  masked,
  parseCents,
  type Draft,
  type Trip,
} from "@/ledger";
import { colors, Field, Header, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function CapsScreen({ trip }: { trip: Trip }) {
  const { draft, saveCaps } = useTrip();
  const [visa, mastercard] = trip.funding;
  const [merchant, setMerchant] = useState(draft?.merchant ?? "");
  const [cart, setCart] = useState(draft ? centsToInput(draft.cartCents) : "");
  const [visaCap, setVisaCap] = useState(draft ? centsToInput(draft.visaCents) : "");
  const [mcCap, setMcCap] = useState(draft ? centsToInput(draft.mastercardCents) : "");
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setMerchant(draft?.merchant ?? "");
      setCart(draft ? centsToInput(draft.cartCents) : "");
      setVisaCap(draft ? centsToInput(draft.visaCents) : "");
      setMcCap(draft ? centsToInput(draft.mastercardCents) : "");
    }, [draft]),
  );

  const cartCents = parseCents(cart);
  const visaCents = parseCents(visaCap);
  const mcCents = parseCents(mcCap);
  const sum = (visaCents ?? 0) + (mcCents ?? 0);

  function save() {
    const name = merchant.trim();
    if (!name || cartCents == null || cartCents <= 0) {
      setMessage("Enter the merchant and the cart.");
      return;
    }
    if (visaCents == null || mcCents == null) {
      setMessage("Enter both caps in dollars and cents.");
      return;
    }
    const next: Draft = {
      merchant: name,
      cartCents,
      visaCents,
      mastercardCents: mcCents,
    };
    saveCaps(next);
    router.push("/card");
  }

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Caps</Title>
          <Muted>Two caps for this cart. They have to sum to it.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Save caps" onPress={save} testID="save-caps" />}
    >
      <Field label="Merchant" value={merchant} onChangeText={setMerchant} />
      <Field label="Cart" value={cart} onChangeText={setCart} keyboardType="decimal-pad" />
      <Field
        label={`${visa.name} ${masked(visa.last4)}`}
        hint={`${formatDollars(visa.remainingCents)} left`}
        value={visaCap}
        onChangeText={setVisaCap}
        keyboardType="decimal-pad"
      />
      <Field
        label={`${mastercard.name} ${masked(mastercard.last4)}`}
        hint={`${formatDollars(mastercard.remainingCents)} left`}
        value={mcCap}
        onChangeText={setMcCap}
        keyboardType="decimal-pad"
      />
      <Text style={styles.sum}>
        {visaCents == null ? "—" : formatDollars(visaCents)} + {mcCents == null ? "—" : formatDollars(mcCents)} ={" "}
        {visaCents == null || mcCents == null ? "—" : formatDollars(sum)}
      </Text>
      <Text style={styles.against}>
        Against a {cartCents == null ? "—" : formatDollars(cartCents)} cart
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  sum: {
    marginTop: 22,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: colors.ink,
  },
  against: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  message: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
});
