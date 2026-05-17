/**
 * BOUTIQUE BUTTON
 * Unified button for Auth flows and generic actions.
 * CLEANED: Now uses the centralized Boutique.css for layout and strictly
 * scopes dynamic behavior via class variants to prevent global collisions.
 */
export default function BoutiqueButton({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  size = "md", // "sm", "md", "lg"
  ...props
}) {
  const variantClass = `bq-btn--${variant}`;
  const sizeClass = `bq-btn--${size}`;
  const fullWidthClass = fullWidth ? "full-width" : "";

  return (
    <button
      className={`bq-btn ${variantClass} ${sizeClass} ${fullWidthClass}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
