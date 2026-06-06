import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import your Auth Hook
import { Briefcase, LogOut, User, KeyRound, UserPlus } from "lucide-react";

export default function Navbar() {
  // Pull the active user profile and logOut function directly out of your Auth provider context
  const { user, logOut } = useAuth(); 
  
  // A simple boolean flag checking if a real user token session exists
  const isLoggedIn = !!user; 

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logOut();         // Clears cookies/tokens from application memory
    navigate("/login"); // Redirects the browser view straight back to login gate
  };

  return (
    <header className="w-full bg-slate-900 text-white h-16 px-6 flex items-center justify-between shadow-md">
      {/* Brand Identity Branding Logo */}
      <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
        <Briefcase className="h-5 w-5 text-blue-400" />
        <span>JobTracker</span>
      </Link>

      {/* DYNAMIC AUTH ACTIONS PORTAL */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          /* =========================================================
             STATE A: USER IS SIGNED IN -> Show profile info & Logout
             ========================================================= */
          <>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
              <User className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{user?.name || "User"}</span>
            </div>
            
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 h-9 rounded-md transition-colors shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          /* =========================================================
             STATE B: USER IS SIGNED OUT -> Show Register & Sign In Gates
             ========================================================= */
          <>
            <Link to="/login">
              <button className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
                <KeyRound className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            </Link>

            <Link to="/register">
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 h-9 rounded-md transition-all shadow-sm">
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}