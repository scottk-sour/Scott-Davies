'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ type, title, description, duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, type, title, description, duration }])

      // Auto dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    []
  )

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'success', title, description })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'error', title, description, duration: 7000 }) // Longer for errors
    },
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'info', title, description })
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'warning', title, description })
    },
    [toast]
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  const iconStyles = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-amber-600',
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-slide-in',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />

      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Utility hook for common toast patterns
export function useToastActions() {
  const { success, error } = useToast()

  return {
    onSaveSuccess: () => success('Saved successfully', 'Your changes have been saved.'),
    onDeleteSuccess: () => success('Deleted successfully', 'The item has been removed.'),
    onCreateSuccess: (itemName = 'Item') =>
      success(`${itemName} created`, `The ${itemName.toLowerCase()} has been created.`),
    onUpdateSuccess: (itemName = 'Item') =>
      success(`${itemName} updated`, `The ${itemName.toLowerCase()} has been updated.`),
    onError: (message = 'Something went wrong') =>
      error('Error', message || 'Please try again or contact support.'),
    onNetworkError: () =>
      error('Network error', 'Please check your internet connection and try again.'),
    onUnauthorized: () =>
      error('Unauthorized', 'Please log in again to continue.'),
    onValidationError: (message: string) =>
      error('Validation error', message),
  }
}
