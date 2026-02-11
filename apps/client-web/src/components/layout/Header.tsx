import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔑 Final header state
  const isSolid = scrolled || forceSolid;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setAvatarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardLabel = useMemo(() => {
    if (user?.role === "COACH") return "Coach Dashboard";
    if (user?.role === "PARENT") return "Parent Dashboard";
    return "Dashboard";
  }, [user?.role]);

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
                <div className="relative ml-3">
                  <button
                    ref={menuButtonRef}
                    onClick={() => setAvatarOpen((p) => !p)}
                    className="rounded-full p-1"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary text-white">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {avatarOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-3 w-56 rounded-lg border bg-popover shadow-lg"
                    >
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        Signed in as
                        <div className="truncate text-sm text-foreground">
                          {user?.email}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 px-2 pb-2">
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="menu-item text-left"
                        >
                          {dashboardLabel}
                        </button>

                        <button
                          onClick={() => navigate("/payments")}
                          className="menu-item text-left"
                        >
                          Payments
                        </button>

                        <button
                          onClick={() => navigate("/profile")}
                          className="menu-item text-left"
                        >
                          Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="menu-item text-red-600 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
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
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
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
