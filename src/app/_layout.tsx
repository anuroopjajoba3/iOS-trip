import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { colors } from "@/components/ui";
import { TripProvider } from "@/store";

export default function RootLayout() {
  return (
    <TripProvider>
      <View style={styles.root}>
        <View style={styles.column} testID="app-column">
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        </View>
      </View>
    </TripProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  column: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.bg,
  },
});
