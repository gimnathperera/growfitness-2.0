import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Footer } from "./Footer";
import { SideNav } from "./SideNav";


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
      {/* Header */}
      <Header />

      {/* Body Section */}
      <div className="flex flex-1">
        {/* Sidebar (takes fixed width space) */}
        <SideNav />

        {/* Main Content (takes remaining space) */}
        <main className="flex-1 overflow-y-auto p-6 ml-64">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}


