import { ShoppingCartSimple, Snowflake, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import BoutiqueDrawer from "./BoutiqueDrawer";
import BoutiqueNumberInput from "./BoutiqueNumberInput";
import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY } from "./BoutiqueTheme";

import { getBrandLogo } from "../../../config/brandLogos";

function CartItemImage({ item }) {
  const [imgBroken, setBroken] = useState(false);
  const [brandBroken, setBrandBroken] = useState(false);

  const brandLogoUrl = getBrandLogo(item.brand);
  const hasImage = item.imageUrl && item.imageUrl.trim() !== "";

  // 1. Primary: Product Image
  if (hasImage && !imgBroken) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        onError={() => setBroken(true)}
      />
    );
  }

  // 2. Fallback: Brand Logo
  if (brandLogoUrl && !brandBroken) {
    return (
      <img
        src={brandLogoUrl}
        alt={item.brand}
        onError={() => setBrandBroken(true)}
        className="bq-cart-brand-fallback"
      />
    );
  }

  // 3. Ultimate Fallback: Icon
  return (
    <Snowflake size={32} weight="bold" className="bq-cart-icon-fallback" />
  );
}

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
                  <CartItemImage item={item} />
                </div>
                <div className="bq-item-info">
                  <h4 className="bq-item-name">{item.name}</h4>
                  {item.model && (
                    <span className="bq-item-model">{item.model}</span>
                  )}
                  <div className="bq-item-price-group">
                    <span className="bq-item-price">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                    {item.quantity > 1 && (
                      <span className="bq-item-unit-price">
                        ₱{item.price.toLocaleString()} ea.
                      </span>
                    )}
                  </div>

                  <div className="bq-qty-controls">
                    <BoutiqueNumberInput
                      size="sm"
                      value={item.quantity}
                      onChange={(newQty) => onUpdateQuantity(item.id, newQty)}
                      min={1}
                      width="120px"
                    />
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
        .bq-item-img-wrap { width: 115px; height: 115px; background: ${BQ_COLORS.bg}; border-radius: 16px; padding: 10px; flex-shrink: 0; }
        .bq-item-img-wrap {
          width: 80px; height: 80px; background: ${BQ_COLORS.surfaceAlt};
          border-radius: 16px; padding: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid ${BQ_COLORS.border};
        }
        .bq-item-img-wrap img { width: 100%; height: 100%; object-fit: contain; }

        .bq-cart-brand-fallback { opacity: 0.8; filter: grayscale(1) contrast(1.2); }
        .bq-cart-icon-fallback { color: ${BQ_COLORS.inkFaint}; opacity: 0.2; }

        .bq-item-info { flex: 1; }
        .bq-item-name { font-family: ${BQ_FONTS.heading}; font-size: 16px; font-weight: 700; color: ${BQ_COLORS.ink}; margin-bottom: 2px; }
        .bq-item-model { display: block; font-size: 11px; font-weight: 600; color: ${BQ_COLORS.inkFaint}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }

        .bq-item-price-group { display: flex; align-items: baseline; gap: 10px; }
        .bq-item-price { font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 600; color: ${BQ_COLORS.inkMuted}; }
        .bq-item-unit-price { font-family: ${BQ_FONTS.heading}; font-size: 12px; font-weight: 600; color: ${BQ_COLORS.inkFaint}; text-transform: uppercase; letter-spacing: 0.05em; }

        .bq-qty-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }


        .bq-item-remove { background: transparent; border: none; color: ${BQ_COLORS.danger}; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
        .bq-item-remove:hover { opacity: 1; }

        .bq-cart-footer { padding: 32px; border-top: 1px solid ${BQ_COLORS.border}; background: ${BQ_COLORS.surfaceAlt}; }
        .bq-cart-total { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .bq-cart-total span { font-family: ${BQ_FONTS.heading}; font-size: 18px; font-weight: 700; color: ${BQ_COLORS.inkMuted}; }
        .bq-total-amount { font-size: 28px !important; !important; color: ${BQ_COLORS.ink} !important; letter-spacing: -0.04em; }

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
