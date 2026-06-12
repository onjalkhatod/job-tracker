import { useMemo } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Briefcase, LayoutDashboard, BarChart3, LogOut, LogIn, User } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isUserLoggedIn = useMemo(() => {
    return isAuthenticated || !!localStorage.getItem('token');
  }, [isAuthenticated]);

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  const handleLogoutClick = () => {
    logout();
    navigate('/', { replace: true });
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    // 'w-full' ensures the header spans the container; 'px-4 sm:px-6' provides fluid side breathing room
    <header className="w-full border-b border-border bg-background sticky top-0 z-50 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors duration-300">
      
      {/* LEFT: Branding + Primary Navigation */}
      <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
        <Link to="/" className="flex items-center gap-2 select-none shrink-0">
          <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background font-black text-sm tracking-wider">CS</div>
          <span className="font-black tracking-tight text-xl text-foreground hidden sm:block">CareerSync</span>
        </Link>

        {isUserLoggedIn && (
          <nav className="flex items-center gap-1 sm:gap-2 flex-shrink min-w-0 overflow-x-auto no-scrollbar">
            <NavLink to="/dashboard" className={linkStyle}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="truncate hidden md:inline">Dashboard</span>
            </NavLink>
            <NavLink to="/applications" className={linkStyle}>
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="truncate hidden md:inline">Roles</span>
            </NavLink>
            <NavLink to="/analytics" className={linkStyle}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="truncate hidden md:inline">Analytics</span>
            </NavLink>
            <NavLink to="/profile" className={linkStyle}>
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate hidden md:inline">Profile</span>
            </NavLink>
          </nav>
        )}
      </div>

      {/* RIGHT: Action System */}
      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle />
        {isUserLoggedIn ? (
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-medium text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-muted-foreground hover:text-foreground gap-2 font-semibold text-sm"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}