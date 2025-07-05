// src/components/Toast/Toast.jsx
import React from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import styles from './Toast.module.css';

const Toast = () => {
  const { toasts, dismissToast } = useToastContext();

  const getAlertClass = (type) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  };

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${getAlertClass(toast.type)} shadow-lg transition-opacity duration-300 cursor-pointer`}
          onClick={() => dismissToast(toast.id)}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
