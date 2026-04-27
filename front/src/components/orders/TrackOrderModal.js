import icons from '../common/icons';

function TrackOrderModal({ order, onClose }) {
  const isToPay = order.status === 'to_pay';
  const isToDeliver = order.status === 'to_deliver';
  const isToInstall = order.status === 'to_install';
  const isComplete = order.status === 'complete';

  const steps = [
    { label: 'Order Placed', status: 'completed', date: order.date },
    {
      label: 'TO PAY (Admin Confirmation)',
      status: isToPay ? 'processing' : 'completed',
      date: isToPay ? order.date : null
    },
    {
      label: 'TO DELIVER',
      status: isToDeliver ? 'processing' : isToInstall || isComplete ? 'completed' : 'upcoming',
      date: isToDeliver ? order.date : null
    },
    {
      label: 'TO INSTALL',
      status: isToInstall ? 'processing' : isComplete ? 'completed' : 'upcoming',
      date: isToInstall ? order.date : null
    },
    {
      label: 'Complete',
      status: isComplete ? 'completed' : 'upcoming',
      date: isComplete ? (order.estimatedDelivery || order.date) : null
    }
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
            {order.receipt?.receiptNumber && <div>E-Receipt: <strong>{order.receipt.receiptNumber}</strong></div>}
            {order.assignedTechnician && <div>Assigned Technician: <strong>{order.assignedTechnician}</strong></div>}
            {order.estimatedArrival && <div>Estimated Arrival: <strong>{new Date(order.estimatedArrival).toLocaleString()}</strong></div>}
            {order.installationDate && <div>Estimated Installation: <strong>{new Date(order.installationDate).toLocaleDateString()}</strong></div>}
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
