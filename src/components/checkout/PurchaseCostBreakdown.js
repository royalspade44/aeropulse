import { VAT_RATE } from '../../domain/purchase/vatRate';

/**
 * @param {Object} props
 * @param {{ subtotal: number, vatAmount: number, deliveryFee: number, discountAmount: number, total: number }} props.totals
 */
function PurchaseCostBreakdown({ totals }) {
  return (
    <div className="purchase-cost-breakdown">
      <div className="summary-row">
        <span>Subtotal (unit prices)</span>
        <span>₱{totals.subtotal.toLocaleString()}</span>
      </div>
      {totals.discountAmount > 0 && (
        <div className="summary-row discount-row">
          <span>Discounts</span>
          <span>−₱{totals.discountAmount.toLocaleString()}</span>
        </div>
      )}
      <div className="summary-row">
        <span>Value-added tax ({Math.round(VAT_RATE * 100)}%)</span>
        <span>₱{totals.vatAmount.toLocaleString()}</span>
      </div>
      <div className="summary-row">
        <span>Delivery fee (by shipping address / area)</span>
        <span>₱{totals.deliveryFee.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default PurchaseCostBreakdown;
