import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, Muted, PrimaryButton, Screen, Title } from "@/components/ui";

export function WelcomeScreen() {
  return (
    <Screen
      pinned={
        <View style={styles.pad}>
          <Title>Trip Wallet</Title>
          <Muted>Sign up. Trip Wallet gives you a virtual trip card.</Muted>
        </View>
      }
      footer={
        <PrimaryButton label="Sign up" testID="sign-up" onPress={() => router.push("/signup")} />
      }
    >
      <Text style={styles.body}>Trip Wallet issues a virtual trip card. Shops charge that one number. Under it, you plus up to five friends each keep a real credit or debit card. Every spend splits equally, so nobody pays for the group and waits to be paid back.</Text>
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
