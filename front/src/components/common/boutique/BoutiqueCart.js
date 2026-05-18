import { Minus, Plus, ShoppingCartSimple, Trash } from "@phosphor-icons/react";
import BoutiqueDrawer from "./BoutiqueDrawer";
import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY } from "./BoutiqueTheme";

export default function BoutiqueCart({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  getCartTotal,
}) {
  return (
    <BoutiqueDrawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      width="440px"
      title="Your Cart"
    >
      <div className="bq-cart-wrapper">
        <div className="bq-cart-items">
          {cart.length === 0 ? (
            <div className="bq-cart-empty">
              <ShoppingCartSimple size={64} weight="bold" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bq-cart-item">
                <div className="bq-item-img-wrap">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="bq-item-info">
                  <h4 className="bq-item-name">{item.name}</h4>
                  <span className="bq-item-price">
                    ₱{item.price.toLocaleString()}
                  </span>

                  <div className="bq-qty-controls">
                    <div className="bq-qty-pill">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <button
                      className="bq-item-remove"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="bq-cart-footer">
            <div className="bq-cart-total">
              <span>Subtotal</span>
              <span className="bq-total-amount">
                ₱{getCartTotal().toLocaleString()}
              </span>
            </div>
            <button className="bq-checkout-btn" onClick={onCheckout}>
              Checkout Now
            </button>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-cart-wrapper { display: flex; flex-direction: column; height: 100%; }

        .bq-cart-items { flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 32px; }

        .bq-cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: ${BQ_COLORS.inkFaint}; padding-top: 60px; }
        .bq-cart-empty p { font-family: ${BQ_FONTS.heading}; font-weight: 700; margin-top: 16px; }

        .bq-cart-item { display: flex; gap: 20px; }
        .bq-item-img-wrap { width: 80px; height: 80px; background: ${BQ_COLORS.surfaceAlt}; border-radius: 16px; padding: 10px; flex-shrink: 0; }
        .bq-item-img-wrap img { width: 100%; height: 100%; object-fit: contain; }

        .bq-item-info { flex: 1; }
        .bq-item-name { font-family: ${BQ_FONTS.heading}; font-size: 16px; font-weight: 700; color: ${BQ_COLORS.ink}; margin-bottom: 4px; }
        .bq-item-price { font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 800; color: ${BQ_COLORS.inkMuted}; }

        .bq-qty-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
        .bq-qty-pill {
          display: flex; align-items: center; gap: 16px; background: ${BQ_COLORS.surfaceAlt};
          padding: 6px 12px; border-radius: ${BQ_GEOMETRY.radiusPill};
        }
        .bq-qty-pill button { background: transparent; border: none; cursor: pointer; color: ${BQ_COLORS.ink}; display: flex; align-items: center; }
        .bq-qty-pill span { font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px; min-width: 20px; text-align: center; }

        .bq-item-remove { background: transparent; border: none; color: ${BQ_COLORS.danger}; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
        .bq-item-remove:hover { opacity: 1; }

        .bq-cart-footer { padding: 32px; border-top: 1px solid ${BQ_COLORS.border}; background: ${BQ_COLORS.surfaceAlt}; }
        .bq-cart-total { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .bq-cart-total span { font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 700; color: ${BQ_COLORS.inkMuted}; }
        .bq-total-amount { font-size: 28px !important; font-weight: 900 !important; color: ${BQ_COLORS.ink} !important; letter-spacing: -0.04em; }

        .bq-checkout-btn {
          width: 100%; padding: 20px; background: ${BQ_COLORS.brand}; color: white;
          border: none; border-radius: ${BQ_GEOMETRY.radiusPill}; font-family: ${BQ_FONTS.heading};
          font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em;
          cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: all 0.3s;
        }
        .bq-checkout-btn:hover { background: ${BQ_COLORS.brandHover}; transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
      `,
        }}
      />
    </BoutiqueDrawer>
  );
}
