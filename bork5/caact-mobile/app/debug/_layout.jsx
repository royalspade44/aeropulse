// app/debug/_layout.jsx
// Debug tools are only available in development builds.
import { Redirect, Stack } from "expo-router";

export default function DebugLayout() {
  if (!__DEV__) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
