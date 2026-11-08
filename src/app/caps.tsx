import { Redirect } from "expo-router";

import { CapsScreen } from "@/screens/caps";
import { useTrip } from "@/store";

export default function CapsRoute() {
  const { trip } = useTrip();
  if (!trip) return <Redirect href="/" />;
  if (trip.status === "closed") return <Redirect href="/closed" />;
  return <CapsScreen trip={trip} />;
}
