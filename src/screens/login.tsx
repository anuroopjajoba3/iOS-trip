import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, Field, Header, PrimaryButton, Screen, Title } from "@/components/ui";
import { useTrip } from "@/store";

export function LogInScreen() {
  const { logIn } = useTrip();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    const error = await logIn(email, password);
    if (error) {
      setMessage(error);
      return;
    }
    router.replace("/");
  }

  return (
    <Screen
      header={<Header />}
      pinned={
        <View style={styles.pad}>
          <Title>Log in</Title>
        </View>
      }
      footer={<PrimaryButton label="Log in" testID="log-in" onPress={submit} />}
    >
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Field label="Password" value={password} onChangeText={setPassword} secure />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  message: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
  },
});
