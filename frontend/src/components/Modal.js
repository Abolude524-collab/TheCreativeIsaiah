import React from 'react';
import '../styles/Modal.css';

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
