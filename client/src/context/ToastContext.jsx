import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback(
    ({ message, type = 'info', title, duration = 4000, action }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type, title, duration, action, createdAt: Date.now() };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0 && type !== 'loading') {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const updateToast = useCallback(
    (id, { message, type = 'info', title, duration = 4000, action }) => {
      setToasts((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              message: message ?? t.message,
              type: type ?? t.type,
              title: title ?? t.title,
              duration: duration ?? t.duration,
              action: action ?? t.action,
              removing: false,
            };
          }
          return t;
        })
      );

      if (duration > 0 && type !== 'loading') {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, options = {}) =>
      addToast({ message, type: 'success', title: options.title || 'Success', ...options }),
    error: (message, options = {}) =>
      addToast({
        message: typeof message === 'string' ? message : message?.message || 'Something went wrong',
        type: 'error',
        title: options.title || 'Error',
        duration: options.duration || 5000,
        ...options,
      }),
    warning: (message, options = {}) =>
      addToast({ message, type: 'warning', title: options.title || 'Warning', ...options }),
    info: (message, options = {}) =>
      addToast({ message, type: 'info', title: options.title || 'Note', ...options }),
    loading: (message, options = {}) =>
      addToast({ message, type: 'loading', title: options.title || 'Processing...', duration: 0, ...options }),
    promise: async (promise, { loading = 'Loading...', success = 'Completed!', error = 'Failed!' }) => {
      const id = addToast({ message: loading, type: 'loading', title: 'Processing', duration: 0 });
      try {
        const result = await promise;
        const successMsg = typeof success === 'function' ? success(result) : success;
        updateToast(id, { message: successMsg, type: 'success', title: 'Success', duration: 3500 });
        return result;
      } catch (err) {
        const errorMsg = typeof error === 'function' ? error(err) : err?.message || error;
        updateToast(id, { message: errorMsg, type: 'error', title: 'Error', duration: 5000 });
        throw err;
      }
    },
    dismiss: (id) => removeToast(id),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:top-6 sm:right-6"
        aria-live="assertive"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { type, title, message, removing, duration, action } = toast;

  const styles = {
    success: {
      bg: 'bg-white/95 border-emerald-200/80 text-slate-800 shadow-lg shadow-emerald-500/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      bar: 'bg-emerald-500',
      titleColor: 'text-emerald-950 font-semibold',
    },
    error: {
      bg: 'bg-white/95 border-rose-200/80 text-slate-800 shadow-lg shadow-rose-500/10',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      bar: 'bg-rose-500',
      titleColor: 'text-rose-950 font-semibold',
    },
    warning: {
      bg: 'bg-white/95 border-amber-200/80 text-slate-800 shadow-lg shadow-amber-500/10',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      bar: 'bg-amber-500',
      titleColor: 'text-amber-950 font-semibold',
    },
    info: {
      bg: 'bg-white/95 border-blue-200/80 text-slate-800 shadow-lg shadow-blue-500/10',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
      bar: 'bg-blue-500',
      titleColor: 'text-blue-950 font-semibold',
    },
    loading: {
      bg: 'bg-white/95 border-primary-200/80 text-slate-800 shadow-lg shadow-primary-500/10',
      icon: <Loader2 className="w-5 h-5 text-primary-600 animate-spin shrink-0" />,
      bar: 'bg-primary-600',
      titleColor: 'text-primary-950 font-semibold',
    },
  }[type] || {
    bg: 'bg-white/95 border-slate-200 text-slate-800 shadow-lg',
    icon: <Info className="w-5 h-5 text-slate-500 shrink-0" />,
    bar: 'bg-slate-400',
    titleColor: 'text-slate-900 font-semibold',
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-md p-4 transition-all duration-300 ${
        styles.bg
      } ${removing ? 'animate-toastSlideOut opacity-0' : 'animate-toastSlideIn'}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 pt-0.5">
          {title && <p className={`text-xs ${styles.titleColor}`}>{title}</p>}
          <p className="text-sm text-slate-700 font-medium leading-snug mt-0.5">{message}</p>
          {action && (
            <div className="mt-2">
              <button
                onClick={action.onClick}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 transition rounded-lg p-1 hover:bg-slate-100/80"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {duration > 0 && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className={`h-full ${styles.bar}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
          <style>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
