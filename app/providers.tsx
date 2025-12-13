'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from 'next-themes';

import { LanguageProvider } from '@/components/providers/language-provider';
import { AuthSync } from '@/components/common/auth-sync';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthSync />
          {children}
        </ThemeProvider>
      </LanguageProvider>

    </QueryClientProvider>
  );
}
