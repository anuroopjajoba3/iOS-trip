import { router } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
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

export const colors = {
  bg: "#111210",
  white: "#F6F2E8",
  gray: "#969A91",
  cream: "#F4F0E6",
  ink: "#171712",
  line: "#30312D",
  field: "#1B1C19",
  trip: "#F4AD38",
  visa: "#F4AD38",
  mastercard: "#B9E8C9",
  tripOff: "#3A3428",
  visaOff: "#3A3428",
  mastercardOff: "#2A3330",
  tripShadow: "#70451F",
  visaShadow: "#6F431C",
  mastercardShadow: "#456B52",
  buttonShadow: "#5C5C56",
};

export const sampleCopy = "Sample only. No bank, issuer, or card is charged.";
export const authCopy = "The shop charges one trip card. Under it, every person's card pays an equal share.";
export const waitingCopy = "The trip card takes the full amount, then each person's card is charged equally.";

const slabFill = {
  trip: colors.trip,
  visa: colors.visa,
  mastercard: colors.mastercard,
} as const;

const slabFillOff = {
  trip: colors.tripOff,
  visa: colors.visaOff,
  mastercard: colors.mastercardOff,
} as const;

export type SlabTone = keyof typeof slabFill;

const settleEase = Easing.bezier(0.22, 1, 0.36, 1);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

function useSettle(duration: number, delay: number) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: settleEase,
      useNativeDriver: false,
    }).start();
  }, [delay, duration, progress, reduced]);

  return progress;
}

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
  const page = useSettle(520, 0);
  const pageStyle = {
    opacity: page,
    transform: [
      { translateY: page.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
      { scale: page.interpolate({ inputRange: [0, 1], outputRange: [0.992, 1] }) },
    ],
  };
  return (
    <Animated.View style={[styles.screen, pageStyle]}>
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
    </Animated.View>
  );
}

export function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={() => router.back()}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
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

export function DatePill({ children }: { children: string }) {
  return (
    <View style={styles.datePill}>
      <Text style={styles.datePillText}>{children}</Text>
    </View>
  );
}

export function HeroMoney({ children }: { children: string }) {
  return <Text style={styles.hero}>{children}</Text>;
}

export function Muted({ children }: { children: string }) {
  return <Text style={styles.muted}>{children}</Text>;
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

export function KindToggle({
  kind,
  onChange,
}: {
  kind: "credit" | "debit";
  onChange: (kind: "credit" | "debit") => void;
}) {
  return (
    <View style={styles.kinds}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Debit"
        onPress={() => onChange("debit")}
        style={[styles.kind, kind === "debit" && styles.kindOn]}
      >
        <Text style={[styles.kindText, kind === "debit" && styles.kindTextOn]}>Debit</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Credit"
        onPress={() => onChange("credit")}
        style={[styles.kind, kind === "credit" && styles.kindOn]}
      >
        <Text style={[styles.kindText, kind === "credit" && styles.kindTextOn]}>Credit</Text>
      </Pressable>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  hint,
  money,
  secure,
  testID,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  hint?: string;
  money?: boolean;
  secure?: boolean;
  testID?: string;
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <View style={styles.inputRow}>
        {money ? <Text style={styles.prefix}>$</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          autoCorrect={false}
          autoCapitalize={keyboardType === "email-address" || money || secure ? "none" : "words"}
          placeholderTextColor={colors.gray}
          selectionColor={colors.cream}
          style={[styles.input, maxLength && maxLength > 10 ? styles.inputPan : null]}
          testID={testID}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

export function WalletButton({
  added,
  onPress,
}: {
  added: boolean;
  onPress: () => void;
}) {
  if (added) {
    return (
      <View style={styles.walletAdded} testID="wallet-added">
        <Text style={styles.walletAddedText}>In Apple Wallet</Text>
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add to Apple Wallet"
      testID="add-to-wallet"
      onPress={onPress}
      style={({ pressed }) => [styles.wallet, pressed && styles.pressed]}
    >
      <Text style={styles.walletText}>Add to Apple Wallet</Text>
    </Pressable>
  );
}

export function Slab({
  tone,
  label,
  title,
  detail,
  amount,
  status,
  active = true,
}: {
  tone: SlabTone;
  label: string;
  title: string;
  detail?: string;
  amount: string;
  status: string;
  active?: boolean;
}) {
  const ink = active ? colors.ink : "#E6E1D8";
  const quiet = active ? "rgba(23,23,18,0.58)" : "#B7B2A8";
  const fill = active ? slabFill[tone] : slabFillOff[tone];
  const ledge = active
    ? tone === "mastercard"
      ? colors.mastercardShadow
      : colors.tripShadow
    : "#2A2A26";
  return (
    <View
      style={[styles.slab, { backgroundColor: fill, shadowColor: ledge }]}
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${title}, ${amount}, ${status}`}
    >
      <View style={styles.slabTop}>
        <Text style={[styles.slabLabel, { color: quiet }]}>{label}</Text>
        <Text style={[styles.slabStatus, { color: ink }]}>{status}</Text>
      </View>
      <Text style={[styles.slabTitle, { color: ink }]}>{title}</Text>
      {detail ? <Text style={[styles.slabDetail, { color: quiet }]}>{detail}</Text> : null}
      <Text style={[styles.slabAmount, { color: ink }]}>{amount}</Text>
    </View>
  );
}

export function WalletStack({
  cards,
}: {
  cards: Array<{
    tone: SlabTone;
    label: string;
    title: string;
    detail?: string;
    amount: string;
    status: string;
    active?: boolean;
  }>;
}) {
  return (
    <View style={styles.stack}>
      {cards.map((card, index) => (
        <SettlingCard key={`${card.tone}-${card.title}`} index={index}>
          <Slab {...card} />
        </SettlingCard>
      ))}
    </View>
  );
}

function SettlingCard({ index, children }: { index: number; children: ReactNode }) {
  const progress = useSettle(650, 150 + index * 60);
  return (
    <Animated.View
      style={{
        marginTop: index === 0 ? 0 : 8,
        zIndex: index + 1,
        opacity: progress,
        transform: [
          { perspective: 900 },
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          { rotateX: progress.interpolate({ inputRange: [0, 1], outputRange: ["8deg", "0deg"] }) },
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function CardArrive({ children }: { children: ReactNode }) {
  return <SettlingCard index={0}>{children}</SettlingCard>;
}

export function RowEnter({ index, children }: { index: number; children: ReactNode }) {
  const progress = useSettle(480, index * 60);
  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function SampleLine() {
  return <Text style={styles.sample}>{sampleCopy}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 8,
    backgroundColor: colors.bg,
  },
  header: {
    minHeight: 44,
    paddingHorizontal: 10,
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
    color: colors.white,
    marginTop: -2,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "600",
    letterSpacing: -0.7,
    color: colors.white,
  },
  datePill: {
    alignSelf: "flex-start",
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.trip,
    shadowColor: colors.visaShadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  datePillText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  hero: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 52,
    lineHeight: 56,
    fontWeight: "500",
    letterSpacing: -2.4,
    color: colors.white,
  },
  muted: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: colors.buttonShadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  pressed: {
    transform: [{ translateY: 2 }, { scale: 0.985 }],
  },
  iconPressed: {
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.ink,
  },
  field: {
    marginTop: 16,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  fieldHint: {
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
  inputRow: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.field,
  },
  prefix: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.white,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 22,
    color: colors.white,
  },
  inputPan: {
    fontSize: 18,
    letterSpacing: 0.6,
  },
  wallet: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  walletText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  walletAdded: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  walletAddedText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.white,
  },
  stack: {
    paddingTop: 4,
  },
  slab: {
    minHeight: 124,
    borderRadius: 21,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  slabTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slabLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
  },
  slabStatus: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
  },
  slabTitle: {
    marginTop: 8,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  slabDetail: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 16,
  },
  slabAmount: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },
  sample: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray,
  },
  kinds: {
    flexDirection: "row",
    gap: 10,
  },
  kind: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.field,
  },
  kindOn: {
    backgroundColor: colors.trip,
  },
  kindText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  kindTextOn: {
    color: colors.ink,
  },
});
