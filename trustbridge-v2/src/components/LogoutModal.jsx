import { useEffect } from 'react';
import '../styles/Modal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box logout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="modal-icon-wrapper">
          <svg 
            className="modal-icon" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2"/>
            <path d="M12 8V12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#dc2626"/>
          </svg>
        </div>

        {/* Content */}
        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-message">
          Are you sure you want to logout?
        </p>
        
        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-modal-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-modal-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
