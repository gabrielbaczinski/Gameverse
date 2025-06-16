import React, { Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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
        <div className={`toast-notification toast-${type}`}>
          <div className="toast-icon">
            {type === 'success' && <CheckCircleIcon className="h-6 w-6" />}
            {type === 'error' && <XCircleIcon className="h-6 w-6" />}
            {(type === 'info' || type === 'warning') && <InformationCircleIcon className="h-6 w-6" />}
          </div>
          <div className="toast-content">
            <p>{message}</p>
          </div>
          <button className="toast-close" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
          
          <div className="toast-progress-container">
            <div 
              className="toast-progress" 
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          </div>
        </div>
      </div>
    </Transition>,
    document.body
  );
}
