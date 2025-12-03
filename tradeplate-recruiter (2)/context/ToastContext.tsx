import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ToastMessage, ToastType } from '../types';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastIcons = {
  success: <CheckCircle className="text-green-500" />,
  error: <XCircle className="text-red-500" />,
  warning: <AlertTriangle className="text-yellow-500" />,
  info: <Info className="text-blue-500" />,
};

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  return (
    <div className="bg-white rounded-sm shadow-2xl p-4 flex items-start space-x-4 border-l-4 border-brand-gold animate-in fade-in slide-in-from-right-10">
      <div className="shrink-0">{ToastIcons[message.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-brand-dark">{message.message}</p>
      </div>
      <button onClick={() => onDismiss(message.id)} className="text-gray-400 hover:text-brand-dark">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-8 right-8 z-[100] space-y-4">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};