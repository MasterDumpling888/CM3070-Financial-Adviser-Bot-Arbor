'use client';

import { useTheme } from 'next-themes';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="h-full w-full">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full -z-10">
        <img
          src={theme === 'dark' ? '/assets/glow-bg-dark.png' : '/assets/glow-bg.png'}
          alt="Arbor background Glow"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1">
        <img
          src={theme === 'dark' ? '/assets/bg-logo-dark.png' : '/assets/bg-logo.png'}
          alt="Arbor background logo"
          width={500}
          height={500}
        />
      </div>
      {children}
    </div>
  );
}
