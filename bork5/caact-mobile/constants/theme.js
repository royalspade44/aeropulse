// constants/theme.js
// Single source of truth for design tokens.
// Import anywhere: import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export const COLORS = {
  // Brand
  primary: "#1E88E5",
  primaryLight: "#EFF6FF",
  primaryDark: "#1565C0",

  // Semantic
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  success: "#059669",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",

  // Role accents (used to colour staff portals)
  tech: "#0284C7",
  techLight: "#E0F2FE",

  // Surfaces
  bg: "#F5F7FA",
  bgSoft: "#EEF6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Borders
  border: "#E5E7EB",
  borderFocus: "#1E88E5",
  borderInput: "#D9E2EC",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT = {
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  bold: "700",
  black: "800",
};
