// app/manager/_layout.jsx
// Manager portal — login works but the portal is not yet implemented.
import { Redirect } from "expo-router";
import { Stack } from "expo-router/stack";
import { ActivityIndicator, View } from "react-native";

import { COLORS } from "../../constants/theme";
import { useRoleGuard } from "../../hooks/useRoleGuard";

export default function ManagerLayout() {
  const { initialized, allowed, redirectHref } = useRoleGuard([
    "manager",
    "owner",
    "admin",
    "super_admin",
    "super-admin",
  ]);

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!allowed) {
    return <Redirect href={redirectHref} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
