
// Importamos o hook do componente UI
import { useToast as useToastUi } from "@/components/ui/use-toast";

// Exportamos tudo do arquivo original
export * from "@/components/ui/use-toast";

// Re-exportamos o hook como um alias para evitar confusão
export const useToast = useToastUi;
