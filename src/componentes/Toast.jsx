import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function ToastAlert({ message, type = 'error', show }) {
  const toastRef = useRef(null);
  const [toastInstance, setToastInstance] = useState(null);

  useEffect(() => {
    if (toastRef.current) {
      const toast = new window.bootstrap.Toast(toastRef.current);
      setToastInstance(toast);
    }
  }, []);

  useEffect(() => {
    if (show && toastInstance) {
      toastInstance.show();
    }
  }, [show, toastInstance]);

  const bgColor = type === 'success' ? 'success' : 'danger';

  return (
    <div
      ref={toastRef}
      className={`toast align-items-center text-white bg-${bgColor} border-0 position-fixed bottom-0 end-0 m-3`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
}
