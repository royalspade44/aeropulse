import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";
import StickyActionBar from "../../../../components/ui/StickyActionBar";
import TextField from "../../../../components/ui/TextField";
import { COLORS, FONT, RADIUS, SPACING } from "../../../../constants/theme";
import { useUserContext } from "../../../../context/UserContext";

function readParam(value) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default function SignUpStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { register } = useUserContext();
  const role = readParam(params.role);

  const [contactMethod, setContactMethod] = useState("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [messengerHandle, setMessengerHandle] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const registrationPayload = useMemo(
    () => ({
      name_first: readParam(params.name_first).trim(),
      name_last: readParam(params.name_last).trim(),
      suffix: readParam(params.suffix).trim(),
      alias: readParam(params.alias).trim(),
      email: readParam(params.email).trim(),
      password: readParam(params.password),
      address: readParam(params.address).trim(),
      municipality: readParam(params.municipality).trim(),
      municipality_code: readParam(params.municipalityCode).trim(),
      submunicipality: readParam(params.submunicipality).trim(),
      submunicipality_code: readParam(params.submunicipalityCode).trim(),
      thoroughfare: readParam(params.thoroughfare).trim(),
      property_block_lot: readParam(params.propertyBlockLot).trim(),
      apartment_unit: readParam(params.apartmentUnit).trim(),
      landmark: readParam(params.landmark).trim(),
      plus_code: readParam(params.plusCode).trim(),
      contact_method: contactMethod,
      phone: contactMethod === "mobile" ? `+63${mobileNumber}` : "",
      messenger_handle:
        contactMethod === "messenger" ? messengerHandle.trim() : "",
      role: role,
    }),
    [contactMethod, messengerHandle, mobileNumber, params, role],
  );

  const clearContactErrors = () => {
    setErrors((prev) => ({ ...prev, mobile: "", messenger: "" }));
  };

  const validateContactMethod = () => {
    const nextErrors = {};

    if (contactMethod === "mobile") {
      if (!mobileNumber.trim()) {
        nextErrors.mobile = "Mobile number is required.";
      } else if (!/^\d{10}$/.test(mobileNumber.trim())) {
        nextErrors.mobile = "Please enter exactly 10 digits after +63.";
      }
    } else if (!messengerHandle.trim()) {
      nextErrors.messenger = "Facebook Messenger handle is required.";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleCompleteRegistration = async () => {
    if (submitting) {
      return;
    }

    clearContactErrors();
    if (!validateContactMethod()) {
      return;
    }

    setSubmitting(true);
    try {
      const registerResult = await register(registrationPayload);

      if (!registerResult.success) {
        Alert.alert(
          "Registration Failed",
          registerResult.error || "Unable to create account.",
        );
        return;
      }

      router.replace({
        pathname: role === "technician" ? "/technician" : "/customer/oobe",
        params: { registered: "1" },
      });
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error?.message || "Unable to create account right now.",
      );
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
          paddingBottom: 126,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          title="Create Account"
          subtitle="Step 3 of 3: Contact Details"
          color={COLORS.primary}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/sign-up/step/0");
            }
          }}
        />

        <Card>
          <Text
            style={{
              fontSize: FONT.base,
              fontWeight: FONT.bold,
              color: COLORS.textPrimary,
              marginBottom: SPACING.sm,
            }}
          >
            Choose Contact Method
          </Text>

          <TouchableOpacity
            onPress={() => {
              setContactMethod("mobile");
              clearContactErrors();
            }}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor:
                contactMethod === "mobile"
                  ? COLORS.primaryLight
                  : "transparent",
              borderRadius: 8,
              marginBottom: SPACING.xs,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor:
                  contactMethod === "mobile" ? COLORS.primary : COLORS.border,
                justifyContent: "center",
                alignItems: "center",
                marginRight: SPACING.sm,
              }}
            >
              {contactMethod === "mobile" ? (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.primary,
                  }}
                />
              ) : null}
            </View>
            <Text style={{ color: COLORS.textPrimary }}>
              Mobile Number (+63)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setContactMethod("messenger");
              clearContactErrors();
            }}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor:
                contactMethod === "messenger"
                  ? COLORS.primaryLight
                  : "transparent",
              borderRadius: 8,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor:
                  contactMethod === "messenger"
                    ? COLORS.primary
                    : COLORS.border,
                justifyContent: "center",
                alignItems: "center",
                marginRight: SPACING.sm,
              }}
            >
              {contactMethod === "messenger" ? (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.primary,
                  }}
                />
              ) : null}
            </View>
            <Text style={{ color: COLORS.textPrimary }}>
              Facebook Messenger
            </Text>
          </TouchableOpacity>
        </Card>

        <Card>
          {contactMethod === "mobile" ? (
            <View style={{ marginBottom: SPACING.sm + 6 }}>
              <Text
                style={{
                  fontSize: FONT.base,
                  color: COLORS.textPrimary,
                  fontWeight: "600",
                  marginBottom: SPACING.xs + 2,
                }}
              >
                Mobile Number
              </Text>
              <View
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: errors.mobile
                    ? COLORS.danger
                    : COLORS.borderInput,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: SPACING.md - 2,
                  paddingVertical: SPACING.md - 2,
                }}
              >
                <Text
                  style={{
                    fontSize: FONT.base,
                    color: COLORS.textPrimary,
                    fontWeight: "600",
                    marginRight: SPACING.xs,
                  }}
                >
                  +63
                </Text>
                <TextInput
                  value={mobileNumber}
                  onChangeText={(value) => {
                    setMobileNumber(value.replace(/\D/g, "").slice(0, 10));
                    setErrors((prev) => ({ ...prev, mobile: "" }));
                  }}
                  placeholder="9123456789"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    fontSize: FONT.base,
                    color: COLORS.textPrimary,
                  }}
                  maxLength={10}
                />
              </View>
              {errors.mobile ? (
                <Text
                  style={{
                    color: COLORS.danger,
                    marginTop: SPACING.xs,
                    fontSize: FONT.sm,
                  }}
                >
                  {errors.mobile}
                </Text>
              ) : null}
            </View>
          ) : (
            <TextField
              label="Facebook Messenger Handle"
              value={messengerHandle}
              onChangeText={(value) => {
                setMessengerHandle(value);
                setErrors((prev) => ({ ...prev, messenger: "" }));
              }}
              placeholder="username or profile URL"
              error={errors.messenger}
              autoCapitalize="none"
            />
          )}

          {contactMethod === "messenger" ? (
            <Text
              style={{
                color: COLORS.textSecondary,
                marginBottom: SPACING.sm,
              }}
            >
              Message the company Facebook page first, then enter the handle you
              used here.
            </Text>
          ) : null}
        </Card>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignItems: "center", marginTop: SPACING.md }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Back to previous step
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <StickyActionBar>
        <Button
          title={submitting ? "Creating Account..." : "Complete Registration"}
          onPress={handleCompleteRegistration}
          variant="primary"
          loading={submitting}
          disabled={submitting}
        />
      </StickyActionBar>
    </SafeAreaView>
  );
}
