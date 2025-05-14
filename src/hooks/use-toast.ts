
// Import from the UI component
import { useToast as useToastUi, toast as toastUi, ToastProvider } from "@/components/ui/use-toast";

// Export everything from the original file
export * from "@/components/ui/use-toast";

// Re-export with aliases to avoid confusion
export const useToast = useToastUi;
export const toast = toastUi;
export { ToastProvider };
