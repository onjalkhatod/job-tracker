import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2 } from "lucide-react";

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleViewDemo = async () => {
    setIsDemoLoading(true);
    try {
      const data = await api.auth.login({ 
        email: 'demo@trackr.com', 
        password: 'demo1234' 
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || "Demo login failed. Please try again.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
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
      
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs sm:flex-row sm:max-w-sm sm:justify-center">
        <Button onClick={() => navigate("/register")} className="w-full sm:w-auto">
          Get Started
        </Button>
        <Button 
          onClick={handleViewDemo} 
          variant="outline" 
          className="w-full sm:w-auto"
          disabled={isDemoLoading}
        >
          {isDemoLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "View Demo"
          )}
        </Button>
      </div>
    </div>
  );
}