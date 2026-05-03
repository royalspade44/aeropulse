// app/(auth)/recover/index.jsx
// Entry point for password recovery - prompts email to receive reset code
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import TextField from "../../../components/ui/TextField";
import { COLORS, SPACING } from "../../../constants/theme";
import { normalizeEmail, validateEmail } from "../../../utils/authValidation";

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else {
      const emailError = validateEmail(email);
      if (emailError) nextErrors.email = emailError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Navigate to factor selection with email
    router.push({
      pathname: "/recover/factor",
      params: { email: normalizeEmail(email) },
    });
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
          title="Recover Account"
          subtitle="Enter your email to get started"
          color={COLORS.primary}
          onBack={() => router.push("/sign-in")}
        />

        <Card>
          <TextField
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="you@example.com"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>

        <Button title="Continue" onPress={handleSubmit} variant="primary" />

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
