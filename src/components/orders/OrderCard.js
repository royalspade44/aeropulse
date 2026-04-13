import icons from '../common/icons';

function OrderCard({ order, onTrack, onReorder }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <div className="order-id">{order.id}</div>
          <div className="order-date">
            <img src={icons.clipboardList} alt="" className="inline-icon" />{' '}
            {new Date(order.date).toLocaleDateString()}
          </div>
        </div>
        <div className={`order-status ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      <div className="order-body">
        <div className="order-items">
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="order-item-image">
                <img src={icons.temperatureFrigid} alt="" className="inline-icon inline-icon--lg" />
              </div>
              <div className="order-item-details">
                <div className="order-item-name">{item.name}</div>
                {item.specs && <div className="order-item-specs">{item.specs}</div>}
                <div className="order-item-price">{'\u20b1'}{item.price.toLocaleString()}</div>
              </div>
              <div>x{item.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-footer">
        <div className="order-total">Total: {'\u20b1'}{order.total.toLocaleString()}</div>
        <div className="order-actions">
          <button type="button" className="order-btn track-btn" onClick={() => onTrack(order)}>
            Track Order
          </button>
          <button type="button" className="order-btn reorder-btn" onClick={() => onReorder(order)}>
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
