import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Briefcase, Activity, CheckCircle, XCircle, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { getCountdown } from '../utils/dateHelpers';

const Dashboard = () => {
  // 1. Fetch analytical telemetry from backend stats portal
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['applicationStats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard intelligence diagnostics');
      }

      return response.json();
    },
  });

  const { data: upcomingInterviews = [] } = useQuery({
    queryKey: ['upcomingInterviews'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/interviews/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const [dismissed, setDismissed] = useState(false);
  const isToday = (dateString) => new Date(dateString).toDateString() === new Date().toDateString();
  const todayInterviews = upcomingInterviews.filter(i => isToday(i.date));

  // 2. Loading Canvas State placeholder sweep
  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin text-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Resolving database metrics...</span>
      </div>
    );
  }

  // 3. Fallback Connection Error State Block
  if (isError) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center space-y-4 rounded-xl border border-red-200 bg-red-50/50 p-6 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-foreground">Failed to synchronize metrics</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ensure your local Express database environment is online and your user authentication token session is valid.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Handle server default fallbacks safely
  const totalApplied = stats?.totalApplied ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const offers = stats?.offers ?? 0;
  const rejected = stats?.rejected ?? 0;
  const upcomingCount = stats?.upcomingInterviews ?? 0;

  const statusData = [
    { name: 'Applied', count: stats?.byStatus.find(s => s.name.toUpperCase() === 'APPLIED')?.count || 0 },
    { name: 'Screening', count: stats?.byStatus.find(s => s.name.toUpperCase() === 'SCREENING')?.count || 0 },
    { name: 'Interview', count: stats?.byStatus.find(s => s.name.toUpperCase() === 'INTERVIEW')?.count || 0 },
    { name: 'Offers', count: stats?.byStatus.find(s => s.name.toUpperCase() === 'OFFER')?.count || 0 },
    { name: 'Rejected', count: stats?.byStatus.find(s => s.name.toUpperCase() === 'REJECTED')?.count || 0 },
  ];

  const chronologicalData = stats?.monthlyTrends && stats.monthlyTrends.length > 0 
    ? stats.monthlyTrends 
    : [
        { month: 'Jan', count: totalApplied },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 }
      ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-background min-h-screen text-foreground transition-colors duration-300">
      
      {/* 1. Amber Banner Strip */}
      {todayInterviews.length > 0 && !dismissed && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <span className="text-sm font-medium">
              Today: {todayInterviews[0].application.company} ({todayInterviews[0].application.role}) 
              at {new Date(todayInterviews[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-amber-700 dark:text-amber-300 hover:text-amber-900">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header Block */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time analytical telemetry tracking aggregate recruitment loops.
        </p>
      </div>

      {/* Grid Stat Matrix Card Panel - Responsive: 1 to 5 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 w-full">
        <div className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity duration-200 ${totalApplied === 0 ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Applied</p>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2"><span className="text-3xl font-bold tracking-tight text-foreground">{totalApplied}</span></div>
        </div>

        <div className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity duration-200 ${inProgress === 0 ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2"><span className="text-3xl font-bold tracking-tight text-foreground">{inProgress}</span></div>
        </div>

        <div className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity duration-200 ${offers === 0 ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offers Secured</p>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2"><span className="text-3xl font-bold tracking-tight text-foreground">{offers}</span></div>
        </div>

        <div className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-opacity duration-200 ${rejected === 0 ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rejections</p>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2"><span className="text-3xl font-bold tracking-tight text-foreground">{rejected}</span></div>
        </div>

        <div className={`rounded-xl border p-6 shadow-sm transition-all duration-200 ${upcomingCount === 0 ? 'border-border bg-card opacity-60' : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/10'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">Interviews Upcoming</p>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2"><span className="text-3xl font-bold tracking-tight text-foreground">{upcomingCount}</span></div>
        </div>
      </div>

      {/* Dual Visual Analytics Charting Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">Pipeline Breakdown</h3>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">Acquisition Over Time</h3>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chronologicalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Interviews (Next 7 Days)</h3>
        {upcomingInterviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingInterviews.map((i) => (
              <div key={i.id} className="p-4 border border-border rounded-xl bg-card shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{i.application.company}</p>
                    <p className="text-sm text-muted-foreground">{i.application.role}</p>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-medium">
                    {getCountdown(i.date)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p>Round: {i.round}</p>
                  <p>Format: {i.format}</p>
                  <p>Time: {new Date(i.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">No interviews scheduled in the next 7 days.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;