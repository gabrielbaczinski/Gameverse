import React, { Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Transition } from '@headlessui/react';

export default function ToastAlert({ show, message, type, onClose, duration = 5000 }) {
  // Auto-fechamento após o tempo definido
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  return ReactDOM.createPortal(
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-x-full opacity-0"
      enterTo="translate-x-0 opacity-100"
      leave="transform ease-in duration-200 transition"
      leaveFrom="translate-x-0 opacity-100"
      leaveTo="translate-x-full opacity-0"
    >
      <div className="toast-container">
        <div className={`toast-alert ${type}`}>
          {/* Ícones baseados no tipo */}
          <div className="toast-icon">
            {type === 'success' && <span>✓</span>}
            {type === 'error' && <span>✕</span>}
            {type === 'info' && <span>ℹ</span>}
            {type === 'warning' && <span>⚠</span>}
          </div>
          
          <div className="toast-content">{message}</div>
          
          <button 
            className="toast-close" 
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    </Transition>,
    document.body
  );
}
