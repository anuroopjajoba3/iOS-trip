import { Redirect } from "expo-router";

import { ChargeCardScreen } from "@/screens/charge-card";
import { useTrip } from "@/store";

export default function CardRoute() {
  const { user, trip, draft } = useTrip();
  if (!user) return <Redirect href="/" />;
  if (!trip) return <Redirect href="/" />;
  if (trip.status === "closed") return <Redirect href="/closed" />;
  if (!draft) return <Redirect href="/caps" />;
  return <ChargeCardScreen trip={trip} draft={draft} />;
}
