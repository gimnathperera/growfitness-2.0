import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import Header from "./Header";


export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
