
"use client";

import { useLocale } from '@/contexts/LocaleContext';
import { LOCALES, type Locale } from '@/config/locales';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center space-x-1 p-1 rounded-md shadow-sm bg-card border border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLocaleChange(LOCALES.FR)}
        className={cn(
          "px-2 py-1 h-7 text-xs font-medium",
          locale === LOCALES.FR ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent/10 text-muted-foreground'
        )}
        aria-pressed={locale === LOCALES.FR}
      >
        FR
      </Button>
      <div className="text-xs text-muted-foreground mx-0.5">|</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLocaleChange(LOCALES.EN)}
        className={cn(
          "px-2 py-1 h-7 text-xs font-medium",
          locale === LOCALES.EN ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent/10 text-muted-foreground'
        )}
        aria-pressed={locale === LOCALES.EN}
      >
        EN
      </Button>
    </div>
  );
}
