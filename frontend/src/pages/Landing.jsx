import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🎯 ACTIVE SESSION CHECKER: If authenticated, automatically bypass the landing view
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleViewDemo = () => {
    navigate("/login?demo=true");
  };

  // Prevent layout flashes while redirecting signed-in sessions
  if (isAuthenticated) return null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 text-center min-h-[calc(100vh-4rem)] bg-slate-50 w-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white mb-6">
        <Briefcase className="h-6 w-6" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        CareerSync
      </h1>
      <p className="mt-4 max-w-md text-base text-slate-600 sm:text-lg">
        Simplify your job search. Track applications, schedule interviews, and organize your career transition in one beautiful, high-density dashboard.
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs sm:flex-row sm:max-w-sm sm:justify-center">
        <Button 
          onClick={() => navigate("/register")} 
          className="w-full sm:w-auto"
        >
          Get Started
        </Button>
        <Button 
          onClick={handleViewDemo} 
          variant="outline" 
          className="w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50"
        >
          View Demo
        </Button>
      </div>
    </div>
  );
}