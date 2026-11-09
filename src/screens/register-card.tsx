import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HowSteps, StepHint } from "@/components/explain";
import { formatPan } from "@/ledger";
import { CardArrive, colors, Muted, PrimaryButton, sampleCopy, Screen, Slab, Title, WalletButton } from "@/components/ui";
import { useTrip } from "@/store";

export function RegisterCardScreen() {
  const { user, acceptTripCard, addToWallet, logOut } = useTrip();
  const tripCard = user?.tripCard;

  function continueOn() {
    acceptTripCard();
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
          <Title>Your trip card</Title>
          <StepHint>Step 2 of 3 · This is the card shops charge</StepHint>
          <Muted>Add it to Apple Wallet. Friends put real cards under it later.</Muted>
        </View>
      }
      footer={<PrimaryButton label="Continue" testID="continue-trip-card" onPress={continueOn} />}
    >
      {tripCard ? (
        <CardArrive>
          <Slab
            tone="trip"
            label={tripCard.name}
            title={formatPan(tripCard.pan)}
            detail={`exp ${tripCard.exp} · cvv ${tripCard.cvv}`}
            amount={tripCard.inWallet ? "Apple Wallet" : "Virtual"}
            status={tripCard.inWallet ? "Wallet" : "Ready"}
            active={tripCard.active}
          />
        </CardArrive>
      ) : null}
      {tripCard ? <WalletButton added={tripCard.inWallet} onPress={addToWallet} /> : null}
      <HowSteps compact />
      <Text style={styles.copy}>{sampleCopy}</Text>
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
  copy: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray,
  },
});
