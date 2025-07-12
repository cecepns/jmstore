import { useCallback } from 'react';

const useToast = () => {
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, type, duration);
    }
  }, []);

  const showSuccess = useCallback((message, duration = 5000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration = 5000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 5000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useToast; 