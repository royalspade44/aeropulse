import { Text, TouchableOpacity, View } from "react-native";

import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function CustomerSectionHeader({ title, actionLabel, onAction, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
      }}
    >
      <Text
        style={{
          color: COLORS.textPrimary,
          fontSize: FONT.lg,
          fontWeight: FONT.black,
        }}
      >
        {title}
      </Text>
      {right ??
        (actionLabel && onAction ? (
          <TouchableOpacity onPress={onAction} activeOpacity={0.72}>
            <Text style={{ color: COLORS.primary, fontWeight: FONT.bold }}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null)}
    </View>
  );
}
