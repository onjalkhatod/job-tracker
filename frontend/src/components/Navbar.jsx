import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Briefcase, LayoutDashboard, BarChart3, LogOut } from 'lucide-react';

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null; // Hide navigation menu on login/register panels

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive 
        ? 'bg-slate-900 text-white shadow-sm' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="border-b bg-white border-slate-200/80 sticky top-0 z-50 shadow-sm px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* App Title Identity */}
        <div className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 bg-slate-950 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider">CS</div>
          <span className="font-black tracking-tight text-xl text-slate-900">CareerSync</span>
        </div>

        {/* 🚀 FIXED MASTER ROUTE SELECTOR BUTTONS: Single-point of Navigation Control */}
        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={linkStyle}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/applications" className={linkStyle}>
            <Briefcase className="h-4 w-4" />
            Tracked Roles
          </NavLink>
          <NavLink to="/analytics" className={linkStyle}>
            <BarChart3 className="h-4 w-4" />
            Pipeline Analytics
          </NavLink>
        </nav>
      </div>

      <Button 
        variant="ghost" 
        onClick={handleLogoutClick}
        className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 font-medium"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
}