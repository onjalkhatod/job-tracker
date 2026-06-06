import { Link, useLocation } from "react-router-dom";
import { Briefcase, BarChart3, ShieldCheck } from "lucide-react";

export default function DashboardLayout({ children }) {
  const location = useLocation();

  const navigation = [
    { name: "Tracked Roles", href: "/", icon: Briefcase },
    { name: "Pipeline Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Persistent Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-1.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-50 tracking-tight text-sm">CareerSync v1.0</span>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-900 dark:text-slate-50" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Dynamic View Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}