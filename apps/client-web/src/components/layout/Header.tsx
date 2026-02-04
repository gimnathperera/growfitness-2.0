import{
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useAuth } from "@/contexts/useAuth";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { confirm, confirmState } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashboardLabel = useMemo(() => {
    if (user?.role === "COACH") return "Coach Dashboard";
    if (user?.role === "PARENT") return "Parent Dashboard";
    return "Dashboard";
  }, [user?.role]);

  const userInitial =
    user?.email?.charAt(0)?.toUpperCase() ?? "?";

  const isActive = (path: string) => location.pathname === path;

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 text-4xl font-bold text-primary font-insanibc"
            >
              <img
                src="/svg/Grow Logo Versions-01.svg"
                alt="Grow Fitness Logo"
                className="w-16 h-16"
              />
              <span className="hidden md:inline">Grow Fitness</span>
            </Link>

            {/* Desktop Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex items-center gap-4">
                {!isAuthenticated && (
                  <>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/login"
                        className={cn(
                          'px-2 py-2 text-xs md:px-6 md:py-2 md:text-lg rounded-full font-[Insaniburger_with_Cheese] shadow-lg inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 bg-white text-primary hover:bg-gray-100',
                          isActive('/login') && 'bg-gray-100'
                        )}
                      >
                        Sign In
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/free-session"
                         className={cn(
                          'w-full md:w-auto px-3 py-2 text-xs md:px-8 md:py-2 md:text-lg rounded-full font-[Insaniburger_with_Cheese] shadow-lg inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 bg-primary hover:bg-[#1e9c70] !text-white',
                          isActive('/free-session') && 'text-accent-foreground'
                    )}
                      >
                        Book Free Session
                      </Link>
                    </NavigationMenuLink>
                  </>
                )}

                {isAuthenticated && (
                  <NavigationMenuItem className="relative">
                    <button
                      ref={menuButtonRef}
                      onClick={() => setIsMenuOpen(prev => !prev)}
                      className="flex items-center justify-center rounded-full"
                    >
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary text-white">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                    {isMenuOpen && (
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
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate("/dashboard");
                            }}
                            className="menu-item items-center justify-center"
                          >
                            {dashboardLabel}
                          </button>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate("/profile");
                            }}
                            className="menu-item flex items-center pl-8"
                          >
                            Profile
                          </button>

                          <button
                            onClick={handleLogout}
                            className="menu-item text-red-600 flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4 ml-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
            >
              <Menu />
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t py-3 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md hover:bg-accent"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/free-session"
                    className="block px-3 py-2 rounded-md bg-primary text-white"
                  >
                    Book Free Session
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md hover:bg-accent"
                  >
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-accent"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirm */}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={open => !open && confirmState.onCancel()}
        title={confirmState.options?.title || ""}
        description={confirmState.options?.description || ""}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}
