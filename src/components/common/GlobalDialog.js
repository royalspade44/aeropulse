import { useEffect, useState } from 'react';
import './GlobalDialog.css';

function GlobalDialog() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      window.dispatchEvent(
        new CustomEvent('app:dialog', {
          detail: { type: 'alert', title: 'Notice', message: String(message || '') }
        })
      );
    };

    const handleDialogEvent = (event) => {
      setDialog(event.detail);
    };

    window.addEventListener('app:dialog', handleDialogEvent);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('app:dialog', handleDialogEvent);
    };
  }, []);

  if (!dialog) return null;

  const closeAlert = () => {
    setDialog(null);
  };

  const resolveConfirm = (value) => {
    if (typeof dialog.resolve === 'function') dialog.resolve(value);
    setDialog(null);
  };

  return (
    <div className="global-dialog-overlay" onClick={() => (dialog.type === 'confirm' ? resolveConfirm(false) : closeAlert())}>
      <div className="global-dialog" onClick={(event) => event.stopPropagation()}>
        <h3>{dialog.title || (dialog.type === 'confirm' ? 'Please Confirm' : 'Notice')}</h3>
        <p>{dialog.message}</p>
        <div className="global-dialog-actions">
          {dialog.type === 'confirm' ? (
            <>
              <button type="button" className="global-dialog-btn secondary" onClick={() => resolveConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="global-dialog-btn primary" onClick={() => resolveConfirm(true)}>
                Confirm
              </button>
            </>
          ) : (
            <button type="button" className="global-dialog-btn primary" onClick={closeAlert}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalDialog;
