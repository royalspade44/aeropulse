/** Fulfillment: Super Admin confirms stock / edits order before ops proceed. */
export const FULFILLMENT_AWAITING_SUPERADMIN = 'awaiting_superadmin_approval';
export const FULFILLMENT_APPROVED = 'approved_for_fulfillment';
export const FULFILLMENT_REJECTED = 'rejected';

/** Payment lifecycle */
export const PAYMENT_PENDING_GATEWAY = 'pending_payment_gateway';
export const PAYMENT_PENDING_COD = 'pending_cod';
export const PAYMENT_PENDING_INSTALL = 'pending_payment_on_installation';
export const PAYMENT_PAID = 'paid';
