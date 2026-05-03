// app/(auth)/login.jsx
// Login screen with email/password and lockout protection
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import PasswordField from "../../components/ui/PasswordField";
import TextField from "../../components/ui/TextField";
import { COLORS, SPACING } from "../../constants/theme";
import { useUserContext } from "../../context/UserContext";
import {
  hasValidationErrors,
  normalizeEmail,
  validateLoginForm,
} from "../../utils/authValidation";

export function LoginScreen() {
  const router = useRouter();
  const { login, resolveHomeRoute } = useUserContext();
  const timerRef = useRef(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLockoutInfo(null);
  };

  const startCountdown = (seconds) => {
    if (!seconds || seconds <= 0) return stopCountdown();
    if (timerRef.current) clearInterval(timerRef.current);
    setLockoutInfo({ secondsLeft: seconds });
    timerRef.current = setInterval(() => {
      setLockoutInfo((prev) => {
        const next = (prev?.secondsLeft ?? 0) - 1;
        if (next <= 0) {
          stopCountdown();
          return null;
        }
        return { secondsLeft: next };
      });
    }, 1000);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleLogin = async () => {
    if (submitting) return;

    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const result = await login(normalizeEmail(form.email), form.password);

      if (result.success) {
        stopCountdown();
        router.replace(resolveHomeRoute(result.user));
        return;
      }

      if (result.locked) {
        startCountdown(result.secondsLeft || 60);
      } else {
        setErrors({
          email: result.error || " ",
          password: result.error || "Invalid credentials.",
        });
      }
    } catch {
      setErrors({ email: "Unable to login right now.", password: "" });
    } finally {
      setSubmitting(false);
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
          title="Welcome Back"
          subtitle="Sign in to your account"
          color={COLORS.primary}
        />

        {lockoutInfo ? (
          <View
            style={{
              backgroundColor: COLORS.dangerLight,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: COLORS.danger,
              padding: SPACING.md,
              marginBottom: SPACING.md,
            }}
          >
            <Text
              style={{
                color: COLORS.danger,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Account Locked
            </Text>
            <Text style={{ color: COLORS.danger }}>
              Too many failed attempts. Try again in {lockoutInfo.secondsLeft}s.
            </Text>
          </View>
        ) : null}

        <Card>
          <TextField
            label="Email or Alias"
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="you@example.com or your alias"
            error={errors.email}
            autoCapitalize="none"
          />
          <PasswordField
            label="Password"
            value={form.password}
            onChangeText={(v) => updateField("password", v)}
            error={errors.password}
          />
        </Card>

        <Button
          title={submitting ? "Signing in…" : "Sign In"}
          onPress={handleLogin}
          variant="primary"
          loading={submitting}
          disabled={submitting || !!lockoutInfo}
        />

        <TouchableOpacity
          onPress={() => router.push("/recover")}
          style={{ alignItems: "center", marginTop: SPACING.md }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/sign-up")}
          style={{ alignItems: "center", marginTop: SPACING.sm }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            New customer? Register
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoginScreen;
