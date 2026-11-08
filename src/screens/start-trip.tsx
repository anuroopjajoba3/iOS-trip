import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, parseCents, parseLast4 } from "@/ledger";
import { colors, Field, Header, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function StartTripScreen() {
  const { start } = useTrip();
  const [name, setName] = useState("");
  const [dates, setDates] = useState("");
  const [visaLast4, setVisaLast4] = useState("");
  const [visaCap, setVisaCap] = useState("");
  const [mcLast4, setMcLast4] = useState("");
  const [mcCap, setMcCap] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const visaCents = parseCents(visaCap);
  const mcCents = parseCents(mcCap);
  const budget = (visaCents ?? 0) + (mcCents ?? 0);

  function save() {
    const tripName = name.trim();
    const tripDates = dates.trim();
    const visa = parseLast4(visaLast4);
    const mastercard = parseLast4(mcLast4);
    if (!tripName || !tripDates) {
      setMessage("Enter the trip name and dates.");
      return;
    }
    if (!visa || !mastercard) {
      setMessage("Enter the last four digits of each card.");
      return;
    }
    if (visaCents == null || mcCents == null || visaCents <= 0 || mcCents <= 0) {
      setMessage("Enter a cap for each card.");
      return;
    }
    const ok = start({
      name: tripName,
      dates: tripDates,
      visaLast4: visa,
      visaCapCents: visaCents,
      mastercardLast4: mastercard,
      mastercardCapCents: mcCents,
    });
    if (!ok) return;
    router.replace("/trip");
  }

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Start a trip</Title>
          <Muted>Two cards fund one PaySplit card.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Open trip" testID="open-trip" onPress={save} />}
    >
      <Field label="Trip" value={name} onChangeText={setName} />
      <Field label="Dates" value={dates} onChangeText={setDates} />
      <Field
        label="Visa last four"
        value={visaLast4}
        onChangeText={setVisaLast4}
        keyboardType="number-pad"
      />
      <Field
        label="Visa cap"
        value={visaCap}
        onChangeText={setVisaCap}
        keyboardType="decimal-pad"
        money
      />
      <Field
        label="Mastercard last four"
        value={mcLast4}
        onChangeText={setMcLast4}
        keyboardType="number-pad"
      />
      <Field
        label="Mastercard cap"
        value={mcCap}
        onChangeText={setMcCap}
        keyboardType="decimal-pad"
        money
      />
      <Text style={styles.budget}>
        Trip budget {visaCents == null || mcCents == null ? "—" : formatDollars(budget)}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  budget: {
    marginTop: 22,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
  },
});
