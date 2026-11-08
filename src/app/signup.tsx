import { Redirect } from "expo-router";

import { SignUpScreen } from "@/screens/signup";
import { useTrip } from "@/store";

export default function SignUpRoute() {
  const { user } = useTrip();
  if (user) return <Redirect href="/" />;
  return <SignUpScreen />;
}
