import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";

import CustomerScreen from "../../../components/customer/CustomerScreen";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import QrCodeMatrix from "../../../components/ui/QrCodeMatrix";
import { COLORS, FONT, RADIUS, SPACING } from "../../../constants/theme";
import { useUserContext } from "../../../context/UserContext";
import {
  ensureCustomerTotpSecret,
  ensureRecoveryCodes,
  regenerateRecoveryCodes,
} from "../../../services/customerSecurityService";

export default function CustomerOobeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { current, updateUser } = useUserContext();
  const [codes, setCodes] = useState([]);
  const [totpSecret, setTotpSecret] = useState("");
  const totpUri = totpSecret
    ? `otpauth://totp/ColdAir:${encodeURIComponent(current?.email || current?.alias || "customer")}?secret=${encodeURIComponent(totpSecret)}&issuer=ColdAir`
    : "";

  useFocusEffect(
    useCallback(() => {
      let active = true;

      Promise.all([
        ensureRecoveryCodes(current?.id),
        ensureCustomerTotpSecret(current?.id),
      ]).then(([nextCodes, nextSecret]) => {
        if (!active) return;
        setCodes(nextCodes);
        setTotpSecret(nextSecret);
      });

      return () => {
        active = false;
      };
    }, [current]),
  );

  const handleRegenerate = async () => {
    const nextCodes = await regenerateRecoveryCodes(current?.id);
    setCodes(nextCodes);
    Alert.alert("Recovery Codes Refreshed", "Your recovery codes were regenerated.");
  };

  const handleContinueHome = async () => {
    if (current?.id && !current?.customerOnboardedAt) {
      await updateUser({
        ...current,
        customerOnboardedAt: new Date().toISOString(),
      });
    }
    router.replace("/customer/home");
  };

  return (
    <CustomerScreen
      title={params.registered ? "Registration Complete" : "Account Security"}
      subtitle={
        params.registered
          ? "Your customer account is ready"
          : "Keep these 6 single-use recovery codes somewhere safe"
      }
    >
      {params.registered ? (
        <Card
          style={{
            backgroundColor: COLORS.successLight,
            borderWidth: 1,
            borderColor: COLORS.success,
          }}
        >
          <Text
            style={{
              color: COLORS.success,
              fontSize: FONT.lg,
              fontWeight: FONT.black,
              marginBottom: SPACING.xs,
            }}
          >
            Successfully registered
          </Text>
          <Text style={{ color: COLORS.textPrimary, lineHeight: 21 }}>
            Review your account recovery options below. When you continue, setup
            will be marked complete and you will be brought to your home page.
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text
          style={{
            color: COLORS.textSecondary,
            lineHeight: 22,
            marginBottom: SPACING.sm,
          }}
        >
          These 12-character recovery codes are shown only during account setup.
          Each code can be used once to help you recover access.
        </Text>
        {codes.map((entry, index) => (
          <View
            key={`${entry.code}_${index}`}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            <Text
              style={{
                color: COLORS.textPrimary,
                fontWeight: FONT.black,
                letterSpacing: 1,
              }}
            >
              {entry.code}
            </Text>
            <View
              style={{
                backgroundColor: entry.used
                  ? COLORS.border
                  : COLORS.successLight,
                borderRadius: RADIUS.full,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: entry.used ? COLORS.textSecondary : COLORS.success,
                  fontSize: FONT.sm,
                }}
              >
                {entry.used ? "Used" : "Active"}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <Text
          style={{
            color: COLORS.textPrimary,
            fontWeight: FONT.black,
            fontSize: FONT.lg,
            marginBottom: SPACING.sm,
          }}
        >
          Authenticator App Setup
        </Text>
        <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.sm }}>
          Scan this QR code in an authenticator app, or enter the secret manually.
        </Text>
        <View style={{ alignItems: "center", marginBottom: SPACING.md }}>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.lg,
              padding: SPACING.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <QrCodeMatrix value={totpUri} size={184} darkColor={COLORS.textPrimary} />
          </View>
        </View>
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: FONT.black,
            letterSpacing: 1,
          }}
        >
          {totpSecret || "Loading..."}
        </Text>
      </Card>

      <Button
        title="Test Account Recovery"
        variant="secondary"
        onPress={() => router.push("/customer/oobe/reset")}
      />
      <Button title="Generate New Recovery Codes" onPress={handleRegenerate} />
      <Button
        title="Continue to Home"
        variant="ghost"
        onPress={handleContinueHome}
      />
    </CustomerScreen>
  );
}
