import { useState, useCallback } from 'react';
import Toast from './Toast';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast method globally
  if (typeof window !== 'undefined') {
    window.showToast = addToast;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="mb-2"
          style={{
            transform: `translateY(${index * 80}px)`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 