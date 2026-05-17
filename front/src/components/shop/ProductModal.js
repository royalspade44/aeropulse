import { useEffect, useState } from "react";
// import icons from "../common/icons";
const icons = {}; // BOUTIQUE MIGRATION STUB

function productPlaceholderIcon(product) {
  if (product?.category === "window") return icons.windowFrame;
  if (product?.category === "floor") return icons.houseChimney;
  return icons.temperatureFrigid;
}

function ModalProductImage({ product }) {
  const hasImage = product?.imageUrl && product.imageUrl.trim() !== "";

  if (hasImage) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="modal-product-img"
        style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
      />
    );
  }

  return (
    <div
      className="modal-product-fallback"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "200px",
        background: "#f1f5f9",
        borderRadius: "12px",
      }}
    >
      <img
        src={productPlaceholderIcon(product)}
        alt=""
        style={{ width: "80px", height: "80px", opacity: 0.15 }}
      />
    </div>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const availableStock = product?.stock;
  const maxQuantity = product?.stock || 0;
  const isOutOfStock = maxQuantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    onClose();
  };

  if (!product) return null;

  return (
    <div
      className="product-modal-overlay"
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: "white",
          width: "100%",
          maxWidth: "900px",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          animation: "modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          type="button"
          className="close-modal-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "white",
            border: "1px solid #e5e7eb",
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          ×
        </button>
        <div
          className="modal-content"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        >
          <div
            className="modal-image"
            style={{
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <ModalProductImage product={product} />
          </div>
          <div
            className="modal-details"
            style={{
              padding: "40px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 4px",
              }}
            >
              {product.name}
            </h2>
            <div
              className="modal-brand"
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "16px",
              }}
            >
              {product.brand}
            </div>
            <div
              className="modal-price"
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "20px",
              }}
            >
              {"\u20b1"}
              {product.price.toLocaleString()}
              {product.oldPrice && (
                <span
                  className="product-old-price"
                  style={{
                    fontSize: "16px",
                    color: "#94a3b8",
                    textDecoration: "line-through",
                    marginLeft: "10px",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  {"\u20b1"}
                  {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p
              className="modal-description"
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              {product.description}
            </p>
            <ul
              className="modal-specs"
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px 0",
                display: "grid",
                gap: "8px",
              }}
            >
              <li
                style={{
                  display: "flex",
                  fontSize: "13.5px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span
                  className="spec-label"
                  style={{ fontWeight: 700, color: "#0f172a", width: "100px" }}
                >
                  Model:
                </span>
                <span>{product.model}</span>
              </li>
              <li
                style={{
                  display: "flex",
                  fontSize: "13.5px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span
                  className="spec-label"
                  style={{ fontWeight: 700, color: "#0f172a", width: "100px" }}
                >
                  Capacity:
                </span>
                <span>{product.specs || product.capacity}</span>
              </li>
              <li
                style={{
                  display: "flex",
                  fontSize: "13.5px",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span
                  className="spec-label"
                  style={{ fontWeight: 700, color: "#0f172a", width: "100px" }}
                >
                  Energy:
                </span>
                <span>{product.energyRating}</span>
              </li>
            </ul>
            {typeof availableStock === "number" ? (
              <div
                className="product-warranty"
                style={{
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: availableStock > 0 ? "#10b981" : "#ef4444",
                }}
              >
                {availableStock > 0
                  ? `${availableStock} units available`
                  : "Out of Stock"}
              </div>
            ) : null}
            <div
              className="quantity-selector"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
                padding: "6px",
                background: "#f1f5f9",
                width: "fit-content",
                borderRadius: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  border: "none",
                  background: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                -
              </button>
              <span
                style={{
                  fontWeight: 800,
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) =>
                    maxQuantity ? Math.min(maxQuantity, prev + 1) : prev + 1,
                  )
                }
                disabled={Boolean(maxQuantity) && quantity >= maxQuantity}
                aria-label="Increase quantity"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  border: "none",
                  background: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="add-to-cart-modal"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                width: "100%",
                padding: "14px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "auto",
              }}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `Add to Cart - \u20b1${(product.price * quantity).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
