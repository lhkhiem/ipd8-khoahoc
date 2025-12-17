'use client';

import { AppSidebar, useSidebar, SidebarProvider } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Toaster } from 'sonner';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
      style={{ 
        marginLeft: isMobile ? '0' : (isCollapsed ? '64px' : '256px')
      }}
    >
      {/* Header */}
      <AppHeader />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <DashboardContent>{children}</DashboardContent>
        
        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </SidebarProvider>
  );
}
