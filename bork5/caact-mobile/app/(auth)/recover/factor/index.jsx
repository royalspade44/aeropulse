// app/(auth)/recover/factor/index.jsx
// Bottom sheet prompting user to choose recovery method
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";
import { COLORS, FONT, SPACING } from "../../../../constants/theme";

export default function RecoverFactorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || "";

  const [selectedFactor, setSelectedFactor] = useState(null);

  const handleSelect = (factor) => {
    setSelectedFactor(factor);
  };

  const handleContinue = () => {
    if (!selectedFactor) {
      Alert.alert("Select Option", "Please select a recovery method.");
      return;
    }

    switch (selectedFactor) {
      case "alias":
        router.push({
          pathname: "/recover/factor/0",
          params: { email },
        });
        break;
      case "password":
        router.push({
          pathname: "/recover/factor/1",
          params: { email },
        });
        break;
      case "code":
        router.push({
          pathname: "/recover/factor/2",
          params: { email },
        });
        break;
    }
  };

  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.42)",
        justifyContent: "flex-end",
      }}
    >
      <ScrollView
        onStartShouldSetResponder={() => true}
        contentContainerStyle={{
          padding: SPACING.md,
          paddingBottom: SPACING.lg,
          backgroundColor: COLORS.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          title="Recover Account"
          subtitle="Choose recovery method"
          color={COLORS.primary}
          onBack={() => router.back()}
        />

        <Card>
          <Text
            style={{
              fontSize: FONT.base,
              fontWeight: FONT.bold,
              color: COLORS.textPrimary,
              marginBottom: SPACING.md,
            }}
          >
            How would you like to recover your account?
          </Text>

          <TouchableOpacity
            onPress={() => handleSelect("alias")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor:
                selectedFactor === "alias"
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
                  selectedFactor === "alias" ? COLORS.primary : COLORS.border,
                justifyContent: "center",
                alignItems: "center",
                marginRight: SPACING.sm,
              }}
            >
              {selectedFactor === "alias" && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.primary,
                  }}
                />
              )}
            </View>
            <Text style={{ color: COLORS.textPrimary }}>
              Recover Sign-in Alias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelect("password")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor:
                selectedFactor === "password"
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
                  selectedFactor === "password"
                    ? COLORS.primary
                    : COLORS.border,
                justifyContent: "center",
                alignItems: "center",
                marginRight: SPACING.sm,
              }}
            >
              {selectedFactor === "password" && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.primary,
                  }}
                />
              )}
            </View>
            <Text style={{ color: COLORS.textPrimary }}>
              Reset Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelect("code")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor:
                selectedFactor === "code"
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
                  selectedFactor === "code" ? COLORS.primary : COLORS.border,
                justifyContent: "center",
                alignItems: "center",
                marginRight: SPACING.sm,
              }}
            >
              {selectedFactor === "code" && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: COLORS.primary,
                  }}
                />
              )}
            </View>
            <Text style={{ color: COLORS.textPrimary }}>
              Use Recovery Code
            </Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedFactor}
          style={{ marginTop: SPACING.sm }}
        />

        <TouchableOpacity
          onPress={() => router.push("/sign-in")}
          style={{ alignItems: "center", marginTop: SPACING.md }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Pressable>
  );
}
