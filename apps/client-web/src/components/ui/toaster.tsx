"use client"

import { CheckCircle2 } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isSuccess = variant === "success"

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 pr-4">
              {isSuccess ? (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grow-100 text-grow-600"
                  aria-hidden
                >
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.25} />
                </span>
              ) : null}
              <div className="grid min-w-0 flex-1 gap-1">
                {title && (
                  <div className="font-semibold leading-tight">{title}</div>
                )}
                {description && (
                  <div
                    className={
                      isSuccess
                        ? "text-sm leading-snug text-grow-900/90"
                        : "text-sm opacity-90"
                    }
                  >
                    {description}
                  </div>
                )}
              </div>
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
