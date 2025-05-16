
// Import from the UI components
import { useToast as useToastUi, toast as toastUi } from "@/components/ui/use-toast";
import { ToastProvider as ToastProviderUi } from "@/components/ui/toast-provider";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Export everything from the original files
export * from "@/components/ui/use-toast";
export * from "@/components/ui/toast-provider";

// Define interface for our toast function
interface ToastOptions {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}

// Extend toast with convenience methods
const toast = {
  ...(toastUi as any),
  
  // Add error method
  error: (options: string | ToastOptions) => {
    if (typeof options === 'string') {
      return toastUi({
        title: 'Erro',
        description: options,
        variant: "destructive",
      });
    }
    return toastUi({
      ...options,
      variant: "destructive",
    });
  },
  
  // Add success method
  success: (options: string | ToastOptions) => {
    if (typeof options === 'string') {
      return toastUi({
        title: 'Sucesso',
        description: options,
        variant: "default",
      });
    }
    return toastUi({
      ...options,
      variant: "default",
    });
  }
};

// Re-export with aliases to avoid confusion
export { useToastUi, toast, ToastProviderUi };
export { ToastProvider } from "@/components/ui/toast-provider";
export { useToast } from "@/components/ui/use-toast";

