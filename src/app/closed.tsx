import { Redirect } from "expo-router";

import { ClosedScreen } from "@/screens/closed";
import { useTrip } from "@/store";

export default function ClosedRoute() {
  const { trip } = useTrip();
  if (!trip) return <Redirect href="/" />;
  if (trip.status !== "closed") return <Redirect href="/trip" />;
  return <ClosedScreen trip={trip} />;
}
