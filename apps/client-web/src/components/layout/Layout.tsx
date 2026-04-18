import { Outlet } from 'react-router-dom';
import Header from './Header';
import { DashboardFooter, Footer } from './Footer';
import { SideNav } from './SideNav';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header (fixed) */}
      <Header />

      <div className="flex flex-1 pt-16 md:pt-20">
        {/* Sidebar (fixed) */}
        <SideNav />

        {/* scrollable area for content and footer */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto lg:ml-64">
          <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-6">
            <Outlet />
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
