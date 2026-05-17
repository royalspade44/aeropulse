import {
  ArrowRight,
  Browser,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Snowflake,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

function productThumbIcon(item) {
  if (item?.category === "window") return Browser;
  if (item?.category === "floor") return Package;
  return Snowflake;
}

function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  getCartTotal,
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const toggleItemSelection = (id) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const handleBatchRemove = () => {
    selectedItems.forEach((id) => onRemoveItem(id));
    setIsEditMode(false);
    setSelectedItems(new Set());
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            zIndex: 1040,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        style={{
          background: "#ffffff",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <div
          className="cart-sidebar-header"
          style={{
            padding: "24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              <ShoppingCart
                size={24}
                weight="bold"
                style={{ color: "#2563eb" }}
              />
              Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
            </h3>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 800,
                  background: isEditMode ? "#fee2e2" : "#eff6ff",
                  color: isEditMode ? "#dc2626" : "#2563eb",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {isEditMode ? "Done" : "Edit Items"}
              </button>
            )}
          </div>
          <button
            className="close-cart"
            onClick={onClose}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              color: "#94a3b8",
              cursor: "pointer",
              marginLeft: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "#fdfdfd",
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "#94a3b8",
              }}
            >
              <ShoppingCart
                size={80}
                weight="thin"
                style={{ opacity: 0.15, marginBottom: "20px" }}
              />
              <p style={{ fontSize: "15px", fontWeight: 600 }}>
                Your cart is empty.
              </p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                Start adding items to build your quote.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const IconComp = productThumbIcon(item);
              const isSelected = selectedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px",
                    background: isSelected ? "#eff6ff" : "#fff",
                    borderRadius: "16px",
                    border: "1.5px solid",
                    borderColor: isSelected ? "#2563eb" : "#f1f5f9",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(37, 99, 235, 0.1)"
                      : "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  {isEditMode && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: "#2563eb",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <IconComp
                      size={32}
                      weight="bold"
                      style={{ color: "#94a3b8", opacity: 0.4 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "4px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#2563eb",
                        fontWeight: 900,
                        marginBottom: "12px",
                      }}
                    >
                      {"\u20b1"}
                      {item.price.toLocaleString()}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "#f1f5f9",
                          padding: "6px 12px",
                          borderRadius: "10px",
                        }}
                      >
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            color: "#475569",
                          }}
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#0f172a",
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            color: "#475569",
                          }}
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                      {!isEditMode && (
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            background: "#fff1f2",
                            border: "none",
                            color: "#e11d48",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                          }}
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "32px 24px",
              borderTop: "1px solid #f1f5f9",
              background: "#ffffff",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {isEditMode ? (
              <button
                onClick={handleBatchRemove}
                disabled={selectedItems.size === 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: 800,
                  cursor: selectedItems.size === 0 ? "not-allowed" : "pointer",
                  opacity: selectedItems.size === 0 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow:
                    selectedItems.size > 0
                      ? "0 4px 12px rgba(220, 38, 38, 0.25)"
                      : "none",
                }}
              >
                <Trash size={20} weight="bold" />
                Remove {selectedItems.size} Selected
              </button>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Est. Total
                  </span>
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#0f172a",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {"\u20b1"}
                    {getCartTotal().toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Confirm & Checkout
                  <ArrowRight size={22} weight="bold" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;
