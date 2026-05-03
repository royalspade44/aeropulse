import { View } from "react-native";
import { COLORS, SPACING } from "../../constants/theme";

export default function StickyActionBar({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.sm,
          paddingBottom: SPACING.md,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
          elevation: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
