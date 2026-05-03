// app/(auth)/sign-up.jsx
// Entry point for multi-step registration; redirects to step/0.
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function SignUpEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-up/step/0");
  }, []);

  return null;
}
