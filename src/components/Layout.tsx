
import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 pb-20">
          {children}
          <BottomNavigation />
        </main>
      </div>
    </SidebarProvider>
  );
};
