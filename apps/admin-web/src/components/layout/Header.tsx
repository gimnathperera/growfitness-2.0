import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { NotificationBell } from '../notifications/NotificationBell';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { confirm, confirmState } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      description: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'default',
    });

    if (confirmed) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h2 className="text-lg font-semibold truncate">
            Admin Portal
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <span className="max-w-[220px] truncate text-sm text-muted-foreground">
              {user?.email}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-1 hover:bg-accent transition-colors">
                  <UserCircle2 className="h-8 w-8 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="break-all text-xs font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open) confirmState.onCancel();
        }}
        title={confirmState.options?.title || ''}
        description={confirmState.options?.description || ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        variant={confirmState.options?.variant}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}