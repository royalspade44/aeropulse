import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../config/api";
import Footer from "../home/Footer";
import "./OrderConfirmation.css";
// import icons from \"../common/icons\";
const icons = {}; // BOUTIQUE MIGRATION STUB

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiRequest(`/orders/me/${orderId}`);
        if (response.order) {
          setOrder(response.order);
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-confirmation-container loading">
        <div className="spinner"></div>
        <p>Fetching your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-container error">
        <img src={icons.diamondExclamation} alt="" className="error-icon" />
        <h2>{error || "Something went wrong"}</h2>
        <button onClick={() => navigate("/shop")} className="primary-btn">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className="success-icon-wrapper">
            <img src={icons.checkCircle} alt="Success" />
          </div>
          <h1>Thank you for your order!</h1>
          <p className="order-code">Order #{order.orderCode}</p>
        </div>

        <div className="confirmation-body">
          <section className="order-status-section">
            <div className="status-label">
              Status:{" "}
              <strong>{order.workflowLabel || order.workflowStatus}</strong>
            </div>
            <p>We've received your order and are currently processing it.</p>
          </section>

          <section className="order-details-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="item-name">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="item-price">
                    ₱{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total Amount</span>
              <strong>₱{order.total.toLocaleString()}</strong>
            </div>
          </section>

          <section className="delivery-info">
            <h3>Delivery To</h3>
            <p className="customer-name">{order.address?.name}</p>
            <p className="customer-address">
              {[
                order.address?.street,
                order.address?.barangay,
                order.address?.city,
                order.address?.province,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="customer-phone">Phone: {order.address?.phone}</p>
          </section>
        </div>

        <div className="confirmation-footer">
          <button
            onClick={() => navigate("/my-orders")}
            className="secondary-btn"
          >
            View My Orders
          </button>
          <button onClick={() => navigate("/shop")} className="primary-btn">
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderConfirmation;
