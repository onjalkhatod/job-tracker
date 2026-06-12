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
    // Fluid wrapper: centered content that respects viewport padding
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] bg-background transition-colors duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background mb-6">
        <Briefcase className="h-6 w-6" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        CareerSync
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
        Simplify your job search. Track applications, schedule interviews, and organize your career transition in one beautiful, high-density dashboard.
      </p>
      
      {/* Responsive button group: stacks on mobile, row on small screens */}
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
          className="w-full sm:w-auto"
        >
          View Demo
        </Button>
      </div>
    </div>
  );
}