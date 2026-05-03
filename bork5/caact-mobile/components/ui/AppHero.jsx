import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { COLORS, FONT, RADIUS, SPACING } from "../../constants/theme";

export default function AppHero({
  eyebrow,
  title,
  subtitle,
  icon = "sparkles-sharp",
  color = COLORS.primary,
  children,
}) {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -34,
          top: -38,
          width: 132,
          height: 132,
          borderRadius: 66,
          backgroundColor: "rgba(255,255,255,0.13)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 50,
          bottom: -42,
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: RADIUS.lg,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: SPACING.sm,
          }}
        >
          <Ionicons name={icon} size={27} color={COLORS.surface} />
        </View>
        <View style={{ flex: 1 }}>
          {!!eyebrow && (
            <Text style={{ color: "#DBEAFE", fontSize: FONT.sm, fontWeight: FONT.bold }}>
              {eyebrow}
            </Text>
          )}
          <Text
            style={{
              color: COLORS.surface,
              fontSize: FONT.xl,
              fontWeight: FONT.black,
              marginTop: 2,
            }}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text style={{ color: "#EFF6FF", marginTop: 4, lineHeight: 20 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {children ? <View style={{ marginTop: SPACING.md }}>{children}</View> : null}
    </View>
  );
}
