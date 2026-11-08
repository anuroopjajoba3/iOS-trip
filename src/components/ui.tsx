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
  bg: "#121212",
  white: "#FFFFFF",
  gray: "#8E8E93",
  cream: "#F3EEE4",
  ink: "#1A1A1A",
  line: "#2A2A2A",
  field: "#1C1C1C",
  paysplit: "#F0C24B",
  visa: "#8EAF7A",
  mastercard: "#A9D4C2",
  paysplitOff: "#3A3428",
  visaOff: "#2C3329",
  mastercardOff: "#2A3330",
};

export const sampleCopy = "Sample only. No bank, issuer, or card is charged.";
export const authCopy = "The merchant authorization is not split.";
export const waitingCopy = "The full amount is being fronted on one PaySplit card.";

const slabFill = {
  paysplit: colors.paysplit,
  visa: colors.visa,
  mastercard: colors.mastercard,
} as const;

const slabFillOff = {
  paysplit: colors.paysplitOff,
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

export function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  hint,
  money,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  hint?: string;
  money?: boolean;
  secure?: boolean;
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
          style={styles.input}
        />
      </View>
    </View>
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
  const quiet = active ? "rgba(26,26,26,0.62)" : "#B7B2A8";
  return (
    <View
      style={[styles.slab, { backgroundColor: active ? slabFill[tone] : slabFillOff[tone] }]}
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
        marginTop: index === 0 ? 0 : -18,
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
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -0.8,
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
    borderRadius: 26,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
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
  stack: {
    paddingTop: 4,
  },
  slab: {
    minHeight: 124,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
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
    fontSize: 26,
    lineHeight: 30,
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
});
