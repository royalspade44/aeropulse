// components/ui/TextField.jsx
import React from "react";
import { Text, TextInput, View } from "react-native";
import { COLORS, FONT, RADIUS, SPACING } from "../../constants/theme";

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoCapitalize,
  style,
  ...props
}) {
  return (
    <View style={{ marginBottom: SPACING.sm + 6 }}>
      {label ? (
        <Text
          style={{
            fontSize: FONT.base,
            color: COLORS.textPrimary,
            fontWeight: "600",
            marginBottom: SPACING.xs + 2,
          }}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={[
          {
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md - 2,
            paddingVertical: SPACING.md - 2,
            borderWidth: 1,
            borderColor: error ? COLORS.danger : COLORS.borderInput,
            fontSize: FONT.base,
            color: COLORS.textPrimary,
          },
          style,
        ]}
        {...props}
      />

      {error ? (
        <Text
          style={{
            color: COLORS.danger,
            marginTop: SPACING.xs,
            fontSize: FONT.sm,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
