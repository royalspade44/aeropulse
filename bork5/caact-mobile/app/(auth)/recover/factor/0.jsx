// app/(auth)/recover/factor/0.jsx
// Alias recovery — sends the user's sign-in alias to their email.
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";
import TextField from "../../../../components/ui/TextField";
import { COLORS, FONT, SPACING } from "../../../../constants/theme";
import { forgotPassword } from "../../../../services/api";

export default function RecoverAliasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email || "";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRecover = async () => {
    setLoading(true);
    try {
      const result = await forgotPassword(email, "alias");
      if (result.success) {
        setSent(true);
      } else {
        Alert.alert(
          "Not Found",
          result.error || "No account found with this email address.",
        );
      }
    } catch {
      Alert.alert("Error", "Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: SPACING.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          title="Recover Alias"
          subtitle="Find your sign-in alias"
          color={COLORS.primary}
          onBack={() => router.back()}
        />

        <Card>
          <TextField
            label="Email"
            value={email}
            onChangeText={() => {}}
            editable={false}
            style={{ color: COLORS.textMuted }}
          />
        </Card>

        {sent ? (
          <Card
            style={{
              backgroundColor: COLORS.successLight,
              borderColor: COLORS.success,
              borderWidth: 1,
            }}
          >
            <Text
              style={{
                fontWeight: FONT.bold,
                color: COLORS.success,
                marginBottom: SPACING.xs,
              }}
            >
              Email Sent
            </Text>
            <Text style={{ color: COLORS.success }}>
              Your sign-in alias has been sent to {email}. Check your inbox.
            </Text>
          </Card>
        ) : (
          <Button
            title={loading ? "Sending..." : "Send Alias to Email"}
            onPress={handleRecover}
            variant="primary"
            loading={loading}
            disabled={loading}
          />
        )}

        <TouchableOpacity
          onPress={() => router.push("/sign-in")}
          style={{ alignItems: "center", marginTop: SPACING.md }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
