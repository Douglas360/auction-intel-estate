
// Import from the UI components
import { useToast as useToastUi, toast as toastUi } from "@/components/ui/use-toast";
import { ToastProvider as ToastProviderUi } from "@/components/ui/toast-provider";

// Export everything from the original files
export * from "@/components/ui/use-toast";
export * from "@/components/ui/toast-provider";

// Re-export with aliases to avoid confusion
export const useToast = useToastUi;
export const toast = toastUi;
export const ToastProvider = ToastProviderUi;
