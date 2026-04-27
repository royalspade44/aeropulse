import { FULFILLMENT_APPROVED, FULFILLMENT_REJECTED } from './orderStatuses';
import { loadOrdersFromStorage, saveOrdersToStorage } from './ordersStorage';

/**
 * @param {string} orderId
 * @param {'approve'|'reject'} action
 * @param {string} [notes]
 * @returns {{ ok: boolean, order?: Object, error?: string }}
 */
export function approveOrRejectOrder(orderId, action, notes = '') {
  const orders = loadOrdersFromStorage();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Order not found' };

  const order = { ...orders[idx] };
  if (action === 'approve') {
    order.fulfillmentStatus = FULFILLMENT_APPROVED;
    order.superAdminApprovedAt = new Date().toISOString();
  } else {
    order.fulfillmentStatus = FULFILLMENT_REJECTED;
  }
  order.superAdminNotes = notes || order.superAdminNotes;
  orders[idx] = order;
  saveOrdersToStorage(orders);
  return { ok: true, order };
}
