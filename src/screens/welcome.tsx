import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HeroStack, HowSteps } from "@/components/explain";
import { colors, PrimaryButton, Screen, Title } from "@/components/ui";

export function WelcomeScreen() {
  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>Trip Wallet</Title>
          <Text style={styles.lede}>One card for the trip. Everyone pays their share.</Text>
        </View>
      }
      footer={
        <PrimaryButton label="Sign up" testID="sign-up" onPress={() => router.push("/signup")} />
      }
    >
      <HeroStack />
      <HowSteps />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log in"
        testID="go-login"
        onPress={() => router.push("/login")}
        style={styles.login}
      >
        <Text style={styles.loginText}>Log in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  lede: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: colors.gray,
  },
  login: {
    marginTop: 28,
    minHeight: 44,
    justifyContent: "center",
  },
  loginText: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
  },
});
