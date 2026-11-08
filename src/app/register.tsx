import { Redirect } from "expo-router";

import { RegisterCardScreen } from "@/screens/register-card";
import { useTrip } from "@/store";

export default function RegisterRoute() {
  const { user } = useTrip();
  if (!user) return <Redirect href="/" />;
  if (user.card) return <Redirect href="/" />;
  return <RegisterCardScreen />;
}
