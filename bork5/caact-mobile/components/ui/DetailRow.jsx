import { Text, View } from "react-native";

import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function DetailRow({ label, value, multiline = false }) {
  return (
    <View
      style={{
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}
    >
      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: FONT.sm,
          marginBottom: 3,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={multiline ? undefined : 1}
        style={{
          color: COLORS.textPrimary,
          fontSize: FONT.md,
          fontWeight: FONT.bold,
        }}
      >
        {value || "Not set"}
      </Text>
    </View>
  );
}
