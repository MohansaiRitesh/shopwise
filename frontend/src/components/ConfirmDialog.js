import React from 'react';
import './ProductModal.css';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box fade-in-up">
        <div className="confirm-icon">🗑️</div>
        <h3 className="confirm-title">{title || 'Are you sure?'}</h3>
        <p className="confirm-msg">{message || 'This action cannot be undone.'}</p>
        <div className="confirm-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              : '🗑 Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
