import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { makeRegisteredCard, parseCents, parseLast4, type CardKind } from "@/ledger";
import { colors, Field, KindToggle, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function RegisterCardScreen() {
  const { registerCard, logOut } = useTrip();
  const [kind, setKind] = useState<CardKind>("debit");
  const [last4, setLast4] = useState("");
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    const digits = parseLast4(last4);
    const limitCents = parseCents(limit);
    if (!digits) {
      setMessage("Enter the last four digits.");
      return;
    }
    if (limitCents == null || limitCents <= 0) {
      setMessage("Enter the amount on the card.");
      return;
    }
    registerCard(makeRegisteredCard(kind, digits, limitCents));
    router.replace("/");
  }

  return (
    <Screen
      header={
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={logOut} style={styles.logOut}>
            <Text style={styles.logOutText}>Log out</Text>
          </Pressable>
        </View>
      }
      pinned={
        <View style={styles.pad}>
          <Title>Your card</Title>
          <Muted>The app makes a virtual trip card when you start a trip. Shops charge that. This is your real debit or credit card sitting under it.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Save card" testID="save-card" onPress={save} />}
    >
      <Text style={styles.label}>Type</Text>
      <KindToggle kind={kind} onChange={setKind} />
      <Field
        label="Last four"
        value={last4}
        onChangeText={setLast4}
        keyboardType="number-pad"
        testID="card-last4"
      />
      <Field
        label="Limit"
        value={limit}
        onChangeText={setLimit}
        keyboardType="decimal-pad"
        money
        testID="card-limit"
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerSpacer: { minWidth: 44, minHeight: 44 },
  logOut: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  logOutText: { fontSize: 16, color: colors.gray },
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: colors.gray,
  },
  message: {
    marginTop: 14,
    fontSize: 14,
    color: colors.white,
  },
});
