import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
      <div>
        <h2 className="text-lg font-semibold">Admin Portal</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

