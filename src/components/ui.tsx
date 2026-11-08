import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { masked, type PaySplitCard as PaySplitCardModel } from "@/ledger";

export const colors = {
  accent: "#2C633D",
  paper: "#F4F1EA",
  ink: "#1C1C1A",
  muted: "#5C5C56",
  line: "#E3E1DA",
};

export const sampleCopy = "Sample only. No bank, issuer, or card is charged.";
export const authCopy = "The merchant authorization is not split.";
export const waitingCopy = "The full amount is being fronted on one PaySplit card.";

export function Screen({
  header,
  pinned,
  children,
  footer,
}: {
  header?: ReactNode;
  pinned?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        {header}
        {pinned}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {footer}
        </View>
      ) : (
        <View style={{ height: Math.max(insets.bottom, 12) }} />
      )}
    </KeyboardAvoidingView>
  );
}

export function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={() => router.back()}
      style={styles.iconButton}
    >
      <Text style={styles.backMark}>‹</Text>
    </Pressable>
  );
}

export function Header({ right }: { right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <BackButton />
      {right ?? <View style={styles.iconButton} />}
    </View>
  );
}

export function Title({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: string }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Money({ amount, caption }: { amount: string; caption: string }) {
  return (
    <View accessibilityRole="text" accessibilityLabel={`${amount} ${caption}`}>
      <Text style={styles.money}>{amount}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <View style={styles.inputRow}>
        {keyboardType ? <Text style={styles.prefix}>$</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCorrect={false}
          autoCapitalize={keyboardType ? "none" : "words"}
          selectionColor={colors.accent}
          style={styles.input}
        />
      </View>
    </View>
  );
}

export function PaySplitCard({
  card,
  amount,
}: {
  card: PaySplitCardModel;
  amount?: string;
}) {
  const live = card.active;
  return (
    <View
      style={[styles.card, live ? styles.cardLive : styles.cardIdle]}
      accessibilityRole="text"
      accessibilityLabel={
        live
          ? `PaySplit card, active, ${masked(card.last4)}, expires ${card.exp}`
          : `PaySplit card, inactive, ${masked(card.last4)}`
      }
    >
      <View style={styles.cardTop}>
        <Text style={[styles.cardBrand, !live && styles.cardIdleText]}>PaySplit</Text>
        <Text style={[styles.cardMeta, !live && styles.cardIdleText]}>
          {live ? card.exp : "Inactive"}
        </Text>
      </View>
      {amount ? (
        <Text style={[styles.cardAmount, !live && styles.cardIdleText]}>{amount}</Text>
      ) : (
        <View style={styles.cardSpacer} />
      )}
      <Text style={[styles.cardNumber, !live && styles.cardIdleText]}>{masked(card.last4)}</Text>
    </View>
  );
}

export function SampleLine() {
  return <Text style={styles.sample}>{sampleCopy}</Text>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.paper,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.paper,
  },
  header: {
    minHeight: 44,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  backMark: {
    fontSize: 32,
    lineHeight: 34,
    color: colors.accent,
    marginTop: -2,
  },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700",
    color: colors.ink,
  },
  muted: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  money: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    color: colors.ink,
  },
  caption: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 22,
    color: colors.muted,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  buttonText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.paper,
  },
  field: {
    marginTop: 18,
  },
  fieldLabel: {
    marginBottom: 4,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  fieldHint: {
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.paper,
  },
  prefix: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 22,
    color: colors.ink,
  },
  card: {
    borderRadius: 16,
    minHeight: 148,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  cardLive: {
    backgroundColor: colors.accent,
  },
  cardIdle: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBrand: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.paper,
  },
  cardMeta: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.paper,
  },
  cardIdleText: {
    color: colors.muted,
  },
  cardAmount: {
    marginTop: 16,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    color: colors.paper,
  },
  cardSpacer: {
    height: 24,
  },
  cardNumber: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 1.5,
    color: colors.paper,
  },
  sample: {
    marginTop: 20,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
});
