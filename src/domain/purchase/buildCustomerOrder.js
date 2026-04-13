import {
  FULFILLMENT_AWAITING_SUPERADMIN,
  PAYMENT_PENDING_COD,
  PAYMENT_PENDING_GATEWAY,
  PAYMENT_PENDING_INSTALL
} from './orderStatuses';

/**
 * Build order object for local persistence (until backend exists).
 * @param {Object} p
 * @param {string} p.orderId
 * @param {string} p.trackingNumber
 * @param {Array} p.cartItems
 * @param {Object} p.address
 * @param {string} p.paymentMethod - 'cod' | 'gcash' | 'credit'
 * @param {string} p.serviceAreaId
 * @param {Object} p.totals - from computePurchaseTotals
 * @param {boolean} [p.fromPostRegistrationCheckout]
 */
export function buildCustomerOrder({
  orderId,
  trackingNumber,
  cartItems,
  address,
  paymentMethod,
  serviceAreaId,
  totals,
  fromPostRegistrationCheckout = false
}) {
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  let paymentStatus = PAYMENT_PENDING_COD;
  if (paymentMethod === 'gcash' || paymentMethod === 'credit') {
    paymentStatus = PAYMENT_PENDING_GATEWAY;
  } else if (paymentMethod === 'pay_on_install') {
    paymentStatus = PAYMENT_PENDING_INSTALL;
  }

  return {
    id: orderId,
    trackingNumber,
    date: new Date().toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      specs: item.specs || '',
      category: item.category
    })),
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    shippingFee: totals.deliveryFee,
    discountAmount: totals.discountAmount,
    total: totals.total,
    address,
    paymentMethod,
    paymentStatus,
    fulfillmentStatus: FULFILLMENT_AWAITING_SUPERADMIN,
    serviceAreaId,
    fromPostRegistrationCheckout,
    status: 'pending',
    superAdminNotes: ''
  };
}
