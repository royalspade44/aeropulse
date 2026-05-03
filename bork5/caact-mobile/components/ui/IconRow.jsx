import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { COLORS, FONT, RADIUS, SPACING } from "../../constants/theme";

export default function IconRow({
  icon,
  title,
  subtitle,
  color = COLORS.primary,
  right,
  style,
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: SPACING.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: RADIUS.md,
          backgroundColor: `${color}16`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: SPACING.sm,
        }}
      >
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.black }}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? null}
    </View>
  );
}
