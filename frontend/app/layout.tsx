import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/ai-elements/auth";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileHeader } from "@/components/ui/mobile-header";
import { Toaster } from 'sonner';
import { ThemeWrapper } from "@/components/theme-wrapper";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} h-screen`}>
            <AuthProvider>
              <ChatProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <ThemeWrapper>
                    <SidebarProvider className='p-6'>
                        <AppSidebar collapsible="icon" />
                        <SidebarInset className="pt-20 md:pt-0">
                          <MobileHeader />   
                          {children}
                          <Toaster position="top-center" />
                        </SidebarInset>
                    </SidebarProvider>
                  </ThemeWrapper>
                </ThemeProvider>
              </ChatProvider>
            </AuthProvider>
      </body>
    </html>
  );
}

