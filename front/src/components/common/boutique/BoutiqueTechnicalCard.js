import { BQ_COLORS } from "./BoutiqueTheme";

/**
 * BOUTIQUE TECHNICAL CARD
 * A boxy, technical container for key unit metadata (HP, Stock, etc.).
 * CLEANED: Now uses the centralized Boutique.css for layout and strictly
 * scopes dynamic colors via inline styles to prevent global collisions.
 */
export default function BoutiqueTechnicalCard({
  children,
  variant = "neutral",
  size = "md", // "sm", "md"
  icon: Icon,
}) {
  const variantStyles = {
    neutral: {
      bg: BQ_COLORS.bg,
      text: BQ_COLORS.ink,
      border: BQ_COLORS.border,
    },
    accent: {
      bg: "rgba(37, 99, 235, 0.05)",
      text: BQ_COLORS.accent,
      border: "rgba(37, 99, 235, 0.15)",
    },
    success: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    danger: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
    brand: { bg: BQ_COLORS.brand, text: "white", border: BQ_COLORS.brand },
    blue: { bg: "#1e40af", text: "white", border: "#1e3a8a" }, // DEEP TECHNICAL BLUE
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <div
      className={`bq-tech-card bq-tech-card--${size}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} weight="bold" />}
      <span>{children}</span>
    </div>
  );
}
