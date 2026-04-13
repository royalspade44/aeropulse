import icons from '../common/icons';

function TrackOrderModal({ order, onClose }) {
  const steps = [
    { label: 'Order Placed', status: 'completed', date: order.date },
    { label: 'Processing', status: order.status === 'processing' ? 'processing' : 'completed', date: order.status !== 'processing' ? order.date : null },
    { label: 'Shipped', status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : order.status === 'processing' ? 'processing' : 'upcoming', date: order.status === 'shipped' ? order.date : null },
    { label: 'Delivered', status: order.status === 'delivered' ? 'completed' : 'upcoming', date: order.status === 'delivered' ? order.estimatedDelivery : null }
  ];

  const stepInner = (step) => {
    if (step.status === 'completed') {
      return <img src={icons.checkCircle} alt="" className="inline-icon" style={{ filter: 'brightness(0) invert(1)' }} />;
    }
    if (step.status === 'processing') {
      return '●';
    }
    return '○';
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="address-modal order-details-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <h3>Track Order</h3>
          <button type="button" className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="tracking-info">
            <div>Order ID: <strong>{order.id}</strong></div>
            <div>Tracking #: <div className="tracking-number">{order.trackingNumber}</div></div>
            <div>Estimated Delivery: <span className="delivery-date">{order.estimatedDelivery}</span></div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Order Status</h4>
            <div style={{ marginTop: '15px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: step.status === 'completed' ? '#4CAF50' : step.status === 'processing' ? '#FF9800' : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    {stepInner(step)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{step.label}</div>
                    {step.date && <div style={{ fontSize: '12px', color: '#999' }}>{new Date(step.date).toLocaleDateString()}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="delivery-address" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <h4>Delivery Address</h4>
            <p><strong>{order.address.name}</strong></p>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.postalCode}</p>
            <p><img src={icons.phoneCall} alt="" className="inline-icon" /> {order.address.phone}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Payment Method</h4>
            <p>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'gcash' ? 'GCash' : 'Credit/Debit Card'}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="confirm-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default TrackOrderModal;
