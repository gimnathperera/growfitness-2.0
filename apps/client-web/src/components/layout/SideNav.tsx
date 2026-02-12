import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  User,
} from "lucide-react";

export function SideNav() {
  const linkClasses =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200";

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r bg-white dark:bg-zinc-900 p-4 mt-20">
      {/* Logo / Title */}
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold tracking-tight">
          Grow Fitness
        </h2>
        <p className="text-xs text-muted-foreground">
          Parent Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClasses} ${
              isActive
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            `${linkClasses} ${
              isActive
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <FileText size={18} />
          Invoices
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkClasses} ${
              isActive
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <User size={18} />
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
