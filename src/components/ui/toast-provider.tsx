
import * as React from "react"
import { ToastContext, createToastProvider } from "./use-toast"

const ToastProviderCreator = createToastProvider()

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { contextValue, children: providerChildren } = ToastProviderCreator({ children })

  return (
    <ToastContext.Provider value={contextValue}>
      {providerChildren}
    </ToastContext.Provider>
  )
}
