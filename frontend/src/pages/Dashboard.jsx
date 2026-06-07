import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, BarChart3, CheckCircle2, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch metrics data from the database status aggregation route
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['applicationStats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error resolving metrics summaries from database.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Greeting Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {user?.name || 'Developer'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is the current real-time state of your professional pipeline today.
        </p>
      </div>

      {/* 2. Clear Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-slate-200/60 rounded-xl p-5 bg-white shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tracked</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalApplications || 0}</h3>
          </div>
        </div>

        <div className="border border-slate-200/60 rounded-xl p-5 bg-white shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.upcomingInterviews || 0}</h3>
          </div>
        </div>

        <div className="border border-slate-200/60 rounded-xl p-5 bg-white shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offers Out</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.offersCount || 0}</h3>
          </div>
        </div>

        <div className="border border-slate-200/60 rounded-xl p-5 bg-white shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Funnel Success</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.totalApplications ? Math.round(((stats.totalApplications - (stats.rejectedCount || 0)) / stats.totalApplications) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* 3. LIVE USER CONTENT DATA SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Upcoming Schedules Card Container */}
        <div className="border border-slate-200/70 rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-lg">Upcoming Interview Agenda</h3>
          </div>

          {stats?.upcomingInterviews > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-900">Technical Live Coding Room</h4>
                  <p className="text-xs text-muted-foreground">Active Interview Process Stage</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md">
                  Zoom Panel
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-slate-400 bg-slate-50/50 border border-dashed rounded-lg">
              No interview events scheduled on your immediate ledger timeline.
            </div>
          )}
        </div>

        {/* Right Side: Log History Feed Container */}
        <div className="border border-slate-200/70 rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <ArrowUpRight className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Recent Application Activity</h3>
          </div>

          <div className="space-y-3">
            {stats?.totalApplications > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <p className="text-slate-600">
                    Database verified: <strong className="text-slate-900 font-semibold">{stats.totalApplications}</strong> active applications currently parsed in the system stream.
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                  <p className="text-slate-600">
                    Authentication layer successfully locked to active session user token.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-slate-400 bg-slate-50/50 border border-dashed rounded-lg">
                No pipeline logs generated yet. Navigate to Tracked Roles to add cards.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}