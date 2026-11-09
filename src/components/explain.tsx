import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors, DatePill, RowEnter } from "@/components/ui";

const howSteps = [
  {
    n: "1",
    title: "You get a trip card",
    body: "The app makes one virtual card for the trip.",
  },
  {
    n: "2",
    title: "Friends add their cards",
    body: "You plus up to five friends put a real card under it.",
  },
  {
    n: "3",
    title: "A shop charges one card",
    body: "The hotel or cafe charges the trip card, not five people.",
  },
  {
    n: "4",
    title: "Everyone pays the same",
    body: "Each card is charged an equal share. Nobody is owed later.",
  },
];

export function HowSteps({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.how}>
      <DatePill>HOW IT WORKS</DatePill>
      {howSteps.map((step, index) => (
        <RowEnter key={step.n} index={index}>
          <View style={styles.step}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{step.n}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              {compact ? null : <Text style={styles.stepBody}>{step.body}</Text>}
            </View>
          </View>
        </RowEnter>
      ))}
    </View>
  );
}

export function StepHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

export function HeroStack() {
  const bob = useRef(new Animated.Value(0)).current;
  const settle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(settle, {
      toValue: 1,
      duration: 700,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, settle]);

  const y = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const enter = {
    opacity: settle,
    transform: [
      { translateY: settle.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
      { scale: settle.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
    ],
  };

  return (
    <Animated.View style={[styles.hero, enter]}>
      <Animated.View style={[styles.heroInner, { transform: [{ translateY: y }] }]}>
        <View style={[styles.mini, styles.miniBack, styles.miniMint]} />
        <View style={[styles.mini, styles.miniMid, styles.miniCream]} />
        <View style={[styles.mini, styles.miniFront]}>
          <Text style={styles.miniLabel}>Trip card</Text>
          <Text style={styles.miniNum}>One trip card</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  how: {
    marginTop: 8,
    gap: 4,
  },
  step: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.trip,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.cardInk,
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.white,
  },
  stepBody: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray,
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.blue,
    fontWeight: "600",
  },
  hero: {
    height: 168,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInner: {
    width: 240,
    height: 140,
  },
  mini: {
    position: "absolute",
    left: 28,
    width: 184,
    height: 108,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  miniBack: {
    top: 18,
    left: 52,
    transform: [{ rotate: "10deg" }],
  },
  miniMid: {
    top: 10,
    left: 40,
    transform: [{ rotate: "5deg" }],
  },
  miniFront: {
    top: 8,
    backgroundColor: colors.trip,
    shadowColor: colors.tripShadow,
  },
  miniMint: {
    backgroundColor: colors.mastercard,
    shadowColor: colors.mastercardShadow,
  },
  miniCream: {
    backgroundColor: colors.cream,
    shadowColor: colors.buttonShadow,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(245,245,247,0.62)",
  },
  miniNum: {
    marginTop: 28,
    fontSize: 18,
    fontWeight: "700",
    color: colors.cardInk,
    letterSpacing: 1,
  },
});
