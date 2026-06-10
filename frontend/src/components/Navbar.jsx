import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Briefcase, LayoutDashboard, BarChart3, LogOut, LogIn } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle'; // ➕ Import your toggle

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogoutClick = () => {
    navigate('/', { replace: true });
    logout();
  };

  // Theme-aware link styles using semantic classes
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground shadow-sm' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm px-6 h-16 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-8">
        {/* App Title Identity */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background font-black text-sm tracking-wider">CS</div>
          <span className="font-black tracking-tight text-xl text-foreground">CareerSync</span>
        </Link>

        {/* INTERNAL NAVIGATION LINKS */}
        {isAuthenticated && (
          <nav className="flex items-center gap-2">
            <NavLink to="/dashboard" className={linkStyle}>
              {/* Added text-inherit to ensure it follows the linkStyle color */}
              <LayoutDashboard className="h-4 w-4 text-inherit" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/applications" className={linkStyle}>
              <Briefcase className="h-4 w-4 text-inherit" />
              <span>Tracked Roles</span>
            </NavLink>
            <NavLink to="/analytics" className={linkStyle}>
              <BarChart3 className="h-4 w-4 text-inherit" />
              <span>Pipeline Analytics</span>
            </NavLink>
          </nav>
        )}
      </div>

      {/* ACTION SYSTEM ROW */}
      <div className="flex items-center gap-2">
        <ModeToggle /> 
        {isAuthenticated ? (
          <Button 
            variant="ghost" 
            onClick={handleLogoutClick}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-medium text-sm"
          >
            {/* Explicitly set color for logout */}
            <LogOut className="h-4 w-4 text-inherit" />
            <span>Sign Out</span>
          </Button>
        ) : (
          <Button 
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-muted-foreground hover:text-foreground gap-2 font-semibold text-sm"
          >
            <LogIn className="h-4 w-4 text-inherit" />
            <span>Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}