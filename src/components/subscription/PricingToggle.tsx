
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

export default function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mt-6 mb-8">
      <Label htmlFor="billing-toggle" className={`text-base ${!isYearly ? 'font-medium' : ''}`}>
        Mensal
      </Label>
      <Switch 
        id="billing-toggle" 
        checked={isYearly} 
        onCheckedChange={onToggle}
      />
      <div className="flex items-center space-x-2">
        <Label htmlFor="billing-toggle" className={`text-base ${isYearly ? 'font-medium' : ''}`}>
          Anual
        </Label>
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          Economize até 20%
        </Badge>
      </div>
    </div>
  );
}
