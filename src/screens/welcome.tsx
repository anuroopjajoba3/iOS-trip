import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, Muted, PrimaryButton, Screen, Title } from "@/components/ui";

export function WelcomeScreen() {
  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>Trip Wallet</Title>
          <Muted>Your trip. Your cards.</Muted>
        </View>
      }
      footer={
        <PrimaryButton label="Sign up" testID="sign-up" onPress={() => router.push("/signup")} />
      }
    >
      <Text style={styles.body}>Sign up. Name your trip, your cards, and who is coming.</Text>
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
    paddingBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
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
