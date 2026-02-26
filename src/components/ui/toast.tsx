"use client"

import { create } from "zustand"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 3000) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }))
    
    // Автоудаление
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

// Хук для удобного использования
export function toast(message: string, type: ToastType = "info") {
  useToast.getState().addToast(message, type)
}

toast.success = (message: string) => toast(message, "success")
toast.error = (message: string) => toast(message, "error")
toast.info = (message: string) => toast(message, "info")

// Компонент контейнера для toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1.5 pointer-events-none max-w-xs w-full">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
  }

  const icons = {
    success: <CheckCircle className={`h-4 w-4 ${iconColors.success}`} />,
    error: <AlertCircle className={`h-4 w-4 ${iconColors.error}`} />,
    info: <Info className={`h-4 w-4 ${iconColors.info}`} />,
  }

  return (
    <div
      className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-background/95 backdrop-blur border shadow-md animate-in slide-in-from-bottom-2 fade-in duration-200"
    >
      {icons[toast.type]}
      <p className="flex-1 text-xs">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:bg-muted"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  )
}