import { useState } from 'react';
import Modal from '../common/Modal';

function RoleIcon({ role, sizeClass = 'inline-icon inline-icon--md' }) {
  if (role.iconSrc) {
    return <img src={role.iconSrc} alt="" className={sizeClass} />;
  }
  return <span>{role.icon}</span>;
}

function RoleSelector({ selectedRole, roles, onRoleChange, disabled }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <div className="role-selector">
        <label>Select Role <span className="required-star">*</span></label>
        <div
          className="role-dropdown"
          onClick={() => !disabled && setShowDropdown(true)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
          role="presentation"
        >
          <div className="role-selected">
            <span className="role-icon">
              <RoleIcon role={selectedRole} />
            </span>
            <span>{selectedRole.label}</span>
          </div>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>

      <Modal isOpen={showDropdown} onClose={() => setShowDropdown(false)}>
        <h3>Select Your Role</h3>
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-option ${selectedRole.id === role.id ? 'selected' : ''}`}
            onClick={() => {
              onRoleChange(role.id);
              setShowDropdown(false);
            }}
            role="presentation"
          >
            <span className="role-icon-large">
              <RoleIcon role={role} sizeClass="inline-icon inline-icon--xl" />
            </span>
            <div className="role-info">
              <div className="role-name">{role.label}</div>
              <div className="role-description">
                {role.id === 'technician'
                  ? 'Access technician portal and manage jobs'
                  : 'Browse products, place orders, and track deliveries'}
              </div>
            </div>
            {selectedRole.id === role.id && <span className="checkmark">{'\u2713'}</span>}
          </div>
        ))}
        <button type="button" className="cancel-btn" onClick={() => setShowDropdown(false)}>
          Cancel
        </button>
      </Modal>
    </>
  );
}

export default RoleSelector;
