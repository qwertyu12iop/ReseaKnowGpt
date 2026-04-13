'use client';

import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
