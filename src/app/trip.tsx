import { Redirect } from "expo-router";

import { TripHome } from "@/screens/trip-home";
import { useTrip } from "@/store";

export default function TripRoute() {
  const { user, trip } = useTrip();
  if (!user) return <Redirect href="/" />;
  if (!trip) return <Redirect href="/" />;
  if (trip.status === "closed") return <Redirect href="/closed" />;
  return <TripHome trip={trip} />;
}
