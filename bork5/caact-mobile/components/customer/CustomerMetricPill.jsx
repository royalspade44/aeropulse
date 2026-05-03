import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function CustomerMetricPill({ label, value, icon, color = COLORS.primary }) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 72,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.xs,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text
        style={{
          color,
          fontSize: FONT.xl,
          fontWeight: FONT.black,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONT.sm, textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}
