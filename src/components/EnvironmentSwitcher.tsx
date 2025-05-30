
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export default function EnvironmentSwitcher() {
  const { selectedEnvironment, setSelectedEnvironment } = useEnvironment();
  const { t } = useLocale();

  const handleValueChange = (value: string) => {
    setSelectedEnvironment(value as EnvironmentKey);
    // Consider closing the popover here if needed, by managing Popover's open state
  };

  return (
    <div className="flex items-center p-1 rounded-md shadow-sm bg-card border border-border">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 px-3 text-sm font-medium text-card-foreground hover:bg-accent/10 data-[state=open]:bg-accent/20"
            aria-label={t('environmentSwitcher_selectPlaceholder')}
          >
            {t('environmentSwitcher_networkLabel')}
            <ChevronDown className="ml-1.5 h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 data-[state=open]:rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 mt-1">
          <Select value={selectedEnvironment} onValueChange={handleValueChange}>
            <SelectTrigger
              id="environment-select-popover"
              className="w-full h-10 text-sm focus:ring-primary rounded-md border-0 shadow-none focus:ring-offset-0" 
              aria-label={t('environmentSwitcher_selectPlaceholder')}
            >
              <SelectValue placeholder={t('environmentSwitcher_selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ENVIRONMENTS) as EnvironmentKey[]).map((key) => (
                <SelectItem key={key} value={key} className="text-sm">
                  {ENVIRONMENTS[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>
    </div>
  );
}
