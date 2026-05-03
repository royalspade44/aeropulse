import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TechButton from "../../../components/technician/TechButton";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import TextField from "../../../components/ui/TextField";
import { COLORS, FONT, SPACING } from "../../../constants/theme";
import { useUserContext } from "../../../context/UserContext";
import { regenerateRecoveryCodes } from "../../../services/customerSecurityService";

export default function TechnicianOobe() {
  const router = useRouter();
  const { current, updateUser } = useUserContext();
  const [alias, setAlias] = useState(current?.alias || "");
  const [phone, setPhone] = useState(current?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!alias.trim() || !phone.trim() || !password) {
      Alert.alert(
        "Required",
        "Alias, contact number, and password are required.",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Please confirm the same password.");
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        ...current,
        alias: alias.trim(),
        phone: phone.trim(),
        password,
        technicianOnboardedAt: new Date().toISOString(),
      });
      const codes = await regenerateRecoveryCodes(current?.id);
      setRecoveryCodes(codes);
      Alert.alert("Onboarding complete", "Your technician profile is ready.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <PageHeader
          title="Technician Setup"
          subtitle="Complete the details your owner-created account still needs"
          color={COLORS.tech}
        />
        <Card>
          <TextField
            label="Sign-in Alias"
            value={alias}
            onChangeText={setAlias}
          />
          <TextField
            label="Contact Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TechButton
            title={saving ? "Saving..." : "Finish Setup"}
            onPress={handleSubmit}
            loading={saving}
          />
          <TechButton
            title="Go to Home"
            onPress={() => router.replace("/technician/home")}
            variant="secondary"
            style={{ marginTop: SPACING.sm }}
          />
        </Card>
        {recoveryCodes.length > 0 && (
          <Card style={{ marginTop: SPACING.md }}>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: FONT.black,
                marginBottom: SPACING.sm,
              }}
            >
              Recovery Codes
            </Text>
            {recoveryCodes.map((entry) => (
              <Text
                key={entry.code || entry}
                style={{ color: COLORS.textSecondary, marginBottom: 4 }}
              >
                {entry.code || entry}
              </Text>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
