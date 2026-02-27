import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "../common/ConfirmDialog";
import {
  Dumbbell,
  Users,
  Phone,
  Info,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";

const logo = "/Grow Logo Versions-01.svg";

const navLinks = [
  { label: "About Us", href: "#about", icon: Info },
  { label: "Our Plans", href: "#plans", icon: Dumbbell },
  { label: "Programs", href: "#programs", icon: Users },
  { label: "Contact Us", href: "#contact", icon: Phone },
];

type HeaderProps = {
  forceSolid?: boolean;
};

export default function Header({ forceSolid = false }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { confirm, confirmState } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect Home Page
  const isHomePage = location.pathname === "/";

  // Header should be solid if:
  // - Not home page
  // - OR user scrolled
  // - OR forceSolid prop is true
  const isSolid = !isHomePage || scrolled || forceSolid;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    // This will run when the component unmounts or when location.pathname changes
    return () => {
      setMenuOpen(false);
    };
  }, [location.pathname]);

  const userInitial = user?.email?.charAt(0)?.toUpperCase() ?? "?";

  const handleLogout = useCallback(async () => {
    const confirmed = await confirm({
      title: "Logout",
      description: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
    });

    if (confirmed) {
      await logout();
      navigate("/login");
    }
  }, [confirm, logout, navigate]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isSolid
            ? "bg-background/95 backdrop-blur-md shadow-card border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Grow Fitness" className="h-10 md:h-12 w-auto" />
              <span
                className={cn(
                  "font-display font-bold text-lg md:text-xl",
                  isSolid ? "text-primary" : "text-white"
                )}
              >
                GrowFitness
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isSolid
                      ? "text-foreground hover:text-primary hover:bg-accent"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </a>
              ))}

              {!isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "ml-3 font-semibold",
                      isSolid
                        ? "border-primary text-primary"
                        : "border-white/40 text-white bg-white/10 hover:bg-white/20"
                    )}
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>

                  <Button
                    size="sm"
                    className="ml-2 font-semibold shadow-md"
                    onClick={() => navigate("/free-session")}
                  >
                    Book Free Session
                  </Button>
                </>
              )}

              {isAuthenticated && (
                <div className="flex items-center gap-3 ml-3">
                  <NotificationBell />
                  
                  {/* Avatar → Dashboard */}
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full p-1 border-none hover:bg-gray-50"
                  >
                    <Avatar className="size-9 cursor-pointer">
                      <AvatarFallback className="bg-primary text-white">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {/* Logout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:bg-gray-50 border-none"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "md:hidden p-2 rounded-lg",
                isSolid ? "text-foreground" : "text-white"
              )}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-background/98 backdrop-blur-lg border-b border-border">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}

              {isAuthenticated && (
                <div className="pt-3 border-t mt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-3 border-t mt-3 flex flex-col gap-2">
                  <Button onClick={() => navigate("/login")}>
                    Sign In
                  </Button>

                  <Button onClick={() => navigate("/free-session")}>
                    Book Free Session
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => !open && confirmState.onCancel()}
        title={confirmState.options?.title || ""}
        description={confirmState.options?.description || ""}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}
