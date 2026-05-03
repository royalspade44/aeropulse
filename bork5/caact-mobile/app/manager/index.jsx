// app/manager/index.jsx
// Placeholder screen for the manager/owner portal.
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import Button from "../../components/ui/Button";
import { COLORS, FONT, SPACING } from "../../constants/theme";
import { useUserContext } from "../../context/UserContext";

export default function ManagerIndexScreen() {
  const { current, logout } = useUserContext();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", padding: SPACING.lg }}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: FONT.xxl, fontWeight: FONT.black, color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: "center" }}>
          Manager Dashboard Coming Soon
        </Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: "center", marginBottom: SPACING.lg }}>
          Signed in as {current?.role} — {current?.email}
        </Text>
        <Button title="Sign Out" onPress={handleLogout} variant="danger" />
      </View>
    </SafeAreaView>
  );
}
