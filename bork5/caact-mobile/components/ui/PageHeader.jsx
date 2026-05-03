import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function PageHeader({
  title,
  subtitle,
  onBack,
  color = COLORS.primary,
}) {
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={12}
          style={{ marginBottom: SPACING.sm }}
        >
          <Ionicons name="arrow-back-sharp" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}

      <View style={{ alignItems: "center", marginTop: onBack ? 0 : SPACING.sm }}>
        <Image
          source={require("../../images/cold logo.png")}
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            marginBottom: SPACING.md,
          }}
        />
        <Text
          style={{
            fontSize: FONT.xxl,
            fontWeight: FONT.black,
            color,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: FONT.base,
              color: COLORS.textSecondary,
              marginTop: SPACING.xs,
              textAlign: "center",
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
