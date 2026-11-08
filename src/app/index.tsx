import { WelcomeScreen } from "@/screens/welcome";
import { RegisterCardScreen } from "@/screens/register-card";
import { TripsScreen } from "@/screens/trips";
import { colors } from "@/components/ui";
import { useTrip } from "@/store";
import { View } from "react-native";

export default function HomeRoute() {
  const { ready, user } = useTrip();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (!user) return <WelcomeScreen />;
  if (!user.revealedTripCard) return <RegisterCardScreen />;
  return <TripsScreen />;
}
