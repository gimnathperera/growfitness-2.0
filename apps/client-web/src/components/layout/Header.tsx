import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/useAuth';
import { useParentProfile } from '@/contexts/parent-profile/ParentProfileProvider';
import { useCoachProfile } from '@/contexts/coach-profile/CoachProfileProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Dumbbell, Users, Info, Menu, X, LogOut } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { Container } from './Container';

const logo = '/Grow Logo Versions-01.svg';

const navLinks = [
  { label: 'About Us', href: '#about', icon: Info },
  { label: 'Our Plans', href: '#plans', icon: Dumbbell },
  { label: 'Programs', href: '#programs', icon: Users },
  { label: 'FAQ', href: '#faq', icon: Info },
];

type HeaderProps = {
  forceSolid?: boolean;
};

export default function Header({ forceSolid = false }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const parentProfile = useParentProfile();
  const coachProfile = useCoachProfile();

  const headerPhotoUrl =
    user?.role === 'PARENT'
      ? parentProfile.photoUrl
      : user?.role === 'COACH'
        ? coachProfile.photoUrl
        : undefined;
  const headerDisplayName =
    user?.role === 'PARENT'
      ? parentProfile.displayName
      : user?.role === 'COACH'
        ? coachProfile.displayName
        : undefined;
  const { confirm: requestConfirm, confirmState } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect Home Page
  const isHomePage = location.pathname === '/';

  // Header should be solid if:
  // - Not home page
  // - OR user scrolled
  // - OR forceSolid prop is true
  const isSolid = !isHomePage || scrolled || forceSolid;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    // This will run when the component unmounts or when location.pathname changes
    return () => {
      setMenuOpen(false);
    };
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    const confirmed = await requestConfirm({
      title: 'Logout',
      description: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await logout();
      navigate('/login');
    }
  }, [requestConfirm, logout, navigate]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logo}
                alt="Grow Fitness"
                className="h-10 md:h-12 w-auto transition-transform group-hover:scale-110"
              />
              <span className="font-display font-bold text-xl md:text-2xl text-brand-green">
                GrowFitness
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-brand-green hover:bg-brand-light transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}

              {!isAuthenticated && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3 font-semibold text-brand-green border-2 border-brand-green hover:bg-brand-green hover:text-white transition-all rounded-full px-6"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>

                  <Button
                    size="sm"
                    className="ml-3 font-semibold shadow-lg bg-brand-green hover:bg-brand-dark text-white rounded-full px-6 transition-all"
                    onClick={() => navigate('/free-session')}
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
                    onClick={() => navigate('/dashboard')}
                    className="rounded-full p-1 border-none hover:bg-gray-50"
                    type="button"
                  >
                    <UserAvatar
                      photoUrl={headerPhotoUrl}
                      displayName={headerDisplayName}
                      email={user?.email}
                      className="size-9 cursor-pointer"
                    />
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
              className={cn('md:hidden p-2 rounded-lg', isSolid ? 'text-foreground' : 'text-primary')}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </Container>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-background/98 backdrop-blur-lg border-b border-border">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => {
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
                  {(user?.role === 'PARENT' || user?.role === 'COACH') && (
                    <div className="flex items-center gap-3 px-4 py-2">
                      <UserAvatar
                        photoUrl={headerPhotoUrl}
                        displayName={headerDisplayName}
                        email={user.email}
                        className="size-10 shrink-0"
                      />
                      <span className="text-sm font-medium truncate">
                        {headerDisplayName}
                      </span>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    Profile
                  </Button>

                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-3 border-t mt-3 flex flex-col gap-2">
                  <Button onClick={() => navigate('/login')}>Sign In</Button>

                  <Button onClick={() => navigate('/free-session')}>Book Free Session</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={open => !open && confirmState.onCancel()}
        title={confirmState.options?.title || ''}
        description={confirmState.options?.description || ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}