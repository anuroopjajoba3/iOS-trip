import { Redirect } from "expo-router";

import { ShareScreen } from "@/screens/share";
import { useTrip } from "@/store";

export default function ShareRoute() {
  const { user, trip } = useTrip();
  if (!user) return <Redirect href="/" />;
  if (!trip || trip.status === "closed") return <Redirect href="/" />;
  return <ShareScreen />;
}
