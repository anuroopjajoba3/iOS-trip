import { Redirect } from "expo-router";

import { ChargeCardScreen } from "@/screens/charge-card";
import { useTrip } from "@/store";

export default function CardRoute() {
  const { trip, draft } = useTrip();
  if (!trip) return <Redirect href="/" />;
  if (trip.status === "closed") return <Redirect href="/closed" />;
  if (!draft) return <Redirect href="/caps" />;
  return <ChargeCardScreen trip={trip} draft={draft} />;
}
