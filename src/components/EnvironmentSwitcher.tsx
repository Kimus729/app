
"use client";

import { useEnvironment } from '@/contexts/EnvironmentContext';
import { ENVIRONMENTS, type EnvironmentKey } from '@/config/environments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useLocale } from '@/contexts/LocaleContext'; // Import useLocale

export default function EnvironmentSwitcher() {
  const { selectedEnvironment, setSelectedEnvironment } = useEnvironment();
  const { t } = useLocale(); // Get t function

  const handleValueChange = (value: string) => {
    setSelectedEnvironment(value as EnvironmentKey);
  };

  return (
    <div className="flex items-center space-x-2 p-1 rounded-md shadow-sm bg-card border border-border">
      <Label htmlFor="environment-select" className="text-sm font-medium text-card-foreground pl-2">
        {t('environmentSwitcher_networkLabel')}
      </Label>
      <Select value={selectedEnvironment} onValueChange={handleValueChange}>
        <SelectTrigger id="environment-select" className="w-[180px] h-9 text-sm focus:ring-primary">
          <SelectValue placeholder={t('environmentSwitcher_selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ENVIRONMENTS) as EnvironmentKey[]).map((key) => (
            <SelectItem key={key} value={key} className="text-sm">
              {ENVIRONMENTS[key].label} {/* Assuming labels are fine in one language or handled if ENVIRONMENTS changes */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
