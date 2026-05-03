// components/ui/NavButton.jsx
// Props:
//   icon         – image require() or { uri: ... }
//   label        – string
//   href         – expo-router path string (e.g. "/customer/cart")
//   onPress      – function (optional override — skips router.push when provided)
//   active       – boolean (optional; auto-detected from pathname when omitted)
//   color        – string (active tint color, default COLORS.primary)
//   inactiveColor– string (default COLORS.textMuted)
//   size         – number (icon size, default 24)
//   badge        – number (optional badge count overlay, shown when > 0)
//   elevated     – boolean (raised circle button — for Shop centre button)
//   flex         – number (default 1)
import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { useRouter, usePathname } from "expo-router";

import { COLORS, FONT, RADIUS } from "../../constants/theme";

export default function NavButton({
  icon,
  label,
  href,
  onPress,
  active,
  color = COLORS.primary,
  inactiveColor = COLORS.textMuted,
  size = 24,
  badge,
  elevated = false,
  flex = 1,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const animValue = useRef(new Animated.Value(0)).current;

  // Determine active state from prop or by matching the current pathname.
  const isActive =
    active !== undefined
      ? active
      : href
        ? pathname === href || pathname.startsWith(href + "/")
        : false;

  // Elevated buttons always show the icon in the supplied `color` (e.g. white on blue circle).
  // Normal buttons switch tint based on active state.
  const iconTintColor = elevated ? color : isActive ? color : inactiveColor;

  // Label below the elevated circle always uses the standard blue/grey scheme regardless of
  // the `color` prop (which is white for the Shop button).
  const labelColor = elevated
    ? isActive
      ? COLORS.primary
      : inactiveColor
    : isActive
      ? color
      : inactiveColor;

  const handlePress = () => {
    // Animate a quick jump: up then back
    animValue.setValue(0);
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      style={{
        flex,
        alignItems: "center",
        justifyContent: "center",
        // Elevated button pops above the nav bar
        ...(elevated ? { marginTop: -30 } : {}),
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          height: 45,
          justifyContent: "center",
          transform: [{ translateY: animValue }],
        }}
      >
        {elevated ? (
          // ── Elevated (Shop-style) button ──────────────────────────────────
          <>
            <View
              style={{
                backgroundColor: COLORS.primary,
                width: 55,
                height: 55,
                borderRadius: 27.5,
                justifyContent: "center",
                alignItems: "center",
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Image
                source={icon}
                style={{
                  width: size + 4,
                  height: size + 4,
                  tintColor: iconTintColor,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: FONT.sm,
                color: labelColor,
                marginTop: 2,
                lineHeight: 16,
                height: 16,
              }}
            >
              {label}
            </Text>
          </>
        ) : (
          // ── Normal button ─────────────────────────────────────────────────
          <>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.md,
                backgroundColor: isActive ? COLORS.primaryLight : COLORS.surfaceAlt,
                borderWidth: 1,
                borderColor: isActive ? COLORS.primary : COLORS.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={icon}
                style={{ width: size, height: size, tintColor: iconTintColor }}
              />
              {/* Badge overlay (e.g. cart count) */}
              {badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -12,
                    backgroundColor: COLORS.danger,
                    borderRadius: RADIUS.full,
                    minWidth: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.surface,
                      fontSize: 10,
                      fontWeight: FONT.bold,
                    }}
                  >
                    {badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: FONT.sm,
                color: labelColor,
                marginTop: 4,
                lineHeight: 16,
                height: 16,
              }}
            >
              {label}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
