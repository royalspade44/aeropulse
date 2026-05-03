import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";
import StickyActionBar from "../../../../components/ui/StickyActionBar";
import { COLORS, FONT, SPACING } from "../../../../constants/theme";

export default function SignUpStep0() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "customer",
      title: "Customer",
      description: "Access customer features like ordering products, tracking deliveries, and managing your account.",
      icon: "person-outline",
    },
    {
      id: "technician",
      title: "Technician",
      description: "Access technician features like managing service requests, inventory, and maintenance tasks.",
      icon: "construct-outline",
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert("Role Required", "Please select your role to continue.");
      return;
    }

    // Store the selected role in router params or global state
    router.push({
      pathname: "/(auth)/sign-up/step/1",
      params: { role: selectedRole },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <PageHeader
        title="Choose Your Role"
        subtitle="Select how you'll be using the app"
        showBack={true}
        onBack={() => router.push("/sign-in")}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.medium }}
      >
        <View style={{ gap: SPACING.medium }}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleSelect(role.id)}
            >
              <Card
                style={{
                  borderColor: selectedRole === role.id ? COLORS.primary : COLORS.border,
                  borderWidth: selectedRole === role.id ? 2 : 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.medium }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: selectedRole === role.id ? COLORS.primary : COLORS.lightGray,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={role.icon}
                      size={24}
                      color={selectedRole === role.id ? COLORS.white : COLORS.gray}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...FONT.bodyLarge,
                        fontWeight: "600",
                        color: COLORS.text,
                        marginBottom: SPACING.small / 2,
                      }}
                    >
                      {role.title}
                    </Text>
                    <Text
                      style={{
                        ...FONT.bodySmall,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {role.description}
                    </Text>
                  </View>

                  {selectedRole === role.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={{ opacity: selectedRole ? 1 : 0.5 }}
        />
      </StickyActionBar>
    </SafeAreaView>
  );
}