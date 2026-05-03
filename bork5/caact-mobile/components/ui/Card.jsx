// components/ui/Card.jsx
import React from "react";
import { View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

export default function Card({ children, style, pressed = false }) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          padding: SPACING.md,
          marginBottom: SPACING.md,
          borderWidth: 1,
          borderColor: COLORS.border,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: pressed ? 0.04 : 0.08,
          shadowRadius: pressed ? 8 : 16,
          elevation: pressed ? 1 : 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
