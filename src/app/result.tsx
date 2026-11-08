import { Redirect } from "expo-router";

import { ResultScreen } from "@/screens/result";
import { useTrip } from "@/store";

export default function ResultRoute() {
  const { trip, draft } = useTrip();
  if (!trip || !draft) return <Redirect href="/" />;
  if (trip.status === "closed") return <Redirect href="/closed" />;
  return <ResultScreen trip={trip} draft={draft} />;
}
