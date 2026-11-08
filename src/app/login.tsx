import { Redirect } from "expo-router";

import { LogInScreen } from "@/screens/login";
import { useTrip } from "@/store";

export default function LogInRoute() {
  const { user } = useTrip();
  if (user) return <Redirect href="/" />;
  return <LogInScreen />;
}
