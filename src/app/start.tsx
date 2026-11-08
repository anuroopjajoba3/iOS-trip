import { Redirect } from "expo-router";

import { StartTripScreen } from "@/screens/start-trip";
import { useTrip } from "@/store";

export default function StartRoute() {
  const { user, trip } = useTrip();
  if (!user) return <Redirect href="/" />;
  if (!user.tripCard || !user.revealedTripCard) return <Redirect href="/register" />;
  if (trip?.status === "open") return <Redirect href="/trip" />;
  return <StartTripScreen />;
}
