// app/_layout.jsx
// Root layout: mounts providers that every screen needs.
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { UserProvider } from "../context/UserContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </UserProvider>
    </SafeAreaProvider>
  );
}
