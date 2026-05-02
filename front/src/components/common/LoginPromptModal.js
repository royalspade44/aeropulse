import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

function LoginPromptModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="login-prompt-overlay" onClick={onClose} role="presentation">
        <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="login-prompt-title">
          <div className="login-prompt-content">
            <div className="login-prompt-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6m0 0v4" />
              </svg>
            </div>
            <h2 id="login-prompt-title" className="login-prompt-title">Authentication Required</h2>
            <p className="login-prompt-message">{message || 'Please log in to access this feature.'}</p>
            <div className="login-prompt-actions">
              <button 
                type="button" 
                className="login-prompt-cancel-btn" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="login-prompt-login-btn" 
                onClick={handleLoginClick}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPromptModal;
