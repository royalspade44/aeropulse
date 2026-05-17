import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../../config/api";
import {
  getAdminNotificationsReadAt,
  markAllAdminNotificationsRead,
} from "../../../utils/adminNotifications";
// import icons from '../../common/icons';
const icons = {}; // BOUTIQUE MIGRATION STUB

const isOlderThanHours = (isoDate, hours) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > hours * 60 * 60 * 1000;
};

function AdminNotificationsBell() {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [readAt, setReadAt] = useState(() => getAdminNotificationsReadAt());
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [lowStockResult, ordersResult] = await Promise.all([
        apiRequest("/products/low-stock").catch(() => ({ products: [] })),
        apiRequest("/orders").catch(() => ({ orders: [] })),
      ]);

      const lowStockCount = (lowStockResult.products || []).filter(
        (p) => Number(p.stock || 0) < 5,
      ).length;

      const pendingOrders = (ordersResult.orders || []).filter((o) => {
        const workflow = String(o.workflowStatus || "");
        if (workflow === "complete" || workflow === "cancelled") return false;
        return isOlderThanHours(o.createdAt, 24);
      });

      const next = [];
      if (lowStockCount > 0) {
        next.push({
          id: "low-stock",
          createdAt: new Date().toISOString(),
          title: "Low stock items",
          message: `${lowStockCount} item(s) have < 5 units remaining.`,
          to: "/admin/reorder",
        });
      }
      if (pendingOrders.length > 0) {
        next.push({
          id: "pending-orders",
          createdAt: new Date().toISOString(),
          title: "Pending orders",
          message: `${pendingOrders.length} pending order(s) are older than 24 hours.`,
          to: "/admin/orders",
        });
      }
      setItems(next);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const pollId = window.setInterval(refresh, 20000);
    return () => window.clearInterval(pollId);
  }, [refresh]);

  useEffect(() => {
    const onClickOutside = (event) => {
      const target = event.target;
      if (!open) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const unreadCount = useMemo(() => {
    const readAtDate = readAt ? new Date(readAt) : null;
    return items.filter((item) => {
      if (!readAtDate) return true;
      const created = new Date(item.createdAt);
      if (Number.isNaN(created.getTime())) return true;
      return created.getTime() > readAt;
    }).length;
  }, [items, readAt]);

  const onMarkAllRead = () => {
    const next = markAllAdminNotificationsRead();
    setReadAt(next);
  };

  const onNavigate = (to) => {
    if (!to) return;
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="admin-notifications">
      <button
        ref={buttonRef}
        type="button"
        className="admin-notifications-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open notifications"
      >
        <img
          src={icons.bellNotification}
          alt=""
          className="inline-icon inline-icon--md"
        />
        {unreadCount > 0 ? (
          <span className="admin-notifications-badge">{unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="admin-notifications-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="admin-notifications-head">
            <div className="admin-notifications-title">Notifications</div>
            <div className="admin-notifications-actions">
              <button
                type="button"
                className="admin-notifications-link"
                onClick={refresh}
                disabled={busy}
              >
                {busy ? "Refreshing…" : "Refresh"}
              </button>
              <button
                type="button"
                className="admin-notifications-link"
                onClick={onMarkAllRead}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="admin-notifications-empty">
              No alerts right now.
            </div>
          ) : (
            <div className="admin-notifications-list">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="admin-notifications-item"
                  onClick={() => onNavigate(item.to)}
                >
                  <div className="admin-notifications-item-title">
                    {item.title}
                  </div>
                  <div className="admin-notifications-item-msg">
                    {item.message}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default AdminNotificationsBell;
