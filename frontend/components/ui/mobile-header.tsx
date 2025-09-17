'use client';

import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import { useTheme } from "next-themes";
import Link from "next/link";
import { User, Heart,  Sun, Moon } from "lucide-react";
import { Button } from "./button";

export function MobileHeader() {
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  if (!isMobile) {
    return null;
  }

  return (
      <div className="flex items-center w-full justify-between fixed top-0 left-0 bg-base z-10 p-4 border-b-1">
        <Link href="/">
          <Logo variant={theme === 'dark' ? 'white' : 'black'} />
        </Link>
        <SidebarTrigger />
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <User />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/watchlist">
            <Heart />
          </Link>
        </Button>
        <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="ghost">
          {theme === 'dark' ? <Sun /> : <Moon />}
          {/* <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span> */}
        </Button>
      </div>
  );
}
