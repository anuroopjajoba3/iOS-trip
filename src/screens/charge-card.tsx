import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { formatDollars, type Draft, type Trip } from "@/ledger";
import {
  authCopy,
  colors,
  Header,
  PaySplitCard,
  PrimaryButton,
  SampleLine,
  Screen,
  Title,
} from "@/components/ui";

export function ChargeCardScreen({ trip, draft }: { trip: Trip; draft: Draft }) {
  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>{draft.merchant}</Title>
        </View>
      }
      footer={
        <PrimaryButton label="Charge" onPress={() => router.push("/result")} testID="charge" />
      }
    >
      <PaySplitCard card={trip.paySplit} amount={formatDollars(draft.cartCents)} />
      <Text style={styles.copy}>{authCopy}</Text>
      <SampleLine />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  copy: {
    marginTop: 20,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
});
