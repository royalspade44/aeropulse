const ORDERS_KEY = 'orders';

export function loadOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrdersToStorage(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
}

export function upsertOrder(order) {
  const orders = loadOrdersFromStorage();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  else orders.unshift(order);
  saveOrdersToStorage(orders);
  return orders;
}
