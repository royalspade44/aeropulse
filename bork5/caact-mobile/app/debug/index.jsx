import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { COLORS, FONT, SPACING } from "../../constants/theme";

const DEBUG_SWITCH_KEY = "debug_master_switch";

export default function DebugIndexScreen() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DEBUG_SWITCH_KEY).then((value) => {
      setEnabled(value === "true");
    });
  }, []);

  const toggleEnabled = async (value) => {
    setEnabled(value);
    await AsyncStorage.setItem(DEBUG_SWITCH_KEY, String(value));
  };

  const clearSwitch = async () => {
    setEnabled(false);
    await AsyncStorage.removeItem(DEBUG_SWITCH_KEY);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ padding: SPACING.md }}>
        <PageHeader
          title="Debug"
          subtitle="Development master switch"
          color={COLORS.primary}
        />
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: SPACING.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: FONT.lg,
                  fontWeight: FONT.black,
                }}
              >
                Master Switch
              </Text>
              <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>
                Enables development-only debug controls.
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={toggleEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={enabled ? COLORS.primary : COLORS.surface}
            />
          </View>
        </Card>
        <Button title="Reset Debug Switch" variant="secondary" onPress={clearSwitch} />
      </View>
    </SafeAreaView>
  );
}
