import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Briefcase, Activity, CheckCircle, XCircle, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  // 1. Fetch analytical telemetry with credentials secure validation token handshakes
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

  // 2. Loading Canvas State placeholder sweep
  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Resolving database metrics...</span>
      </div>
    );
  }

  // 3. Fallback Connection Error State Block
  if (isError) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
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
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Handle server default fallbacks safely if fields are undefined or empty
  const totalApplied = stats?.totalApplied ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const offers = stats?.offers ?? 0;
  const rejected = stats?.rejected ?? 0;
  const upcomingInterviews = stats?.upcomingInterviews ?? 0;

  // Process charting arrays safely from metrics streams
  const statusData = stats?.byStatus ?? [
    { name: 'Applied', count: totalApplied },
    { name: 'In Progress', count: inProgress },
    { name: 'Offers', count: offers },
    { name: 'Rejected', count: rejected }
  ];

  const chronologicalData = stats?.monthlyTrends ?? [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time analytical telemetry tracking aggregate recruitment loops.
        </p>
      </div>

      {/* Grid Stat Matrix Card Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* Total Applied Card */}
        <div className={`rounded-xl border bg-card p-6 shadow-sm transition-opacity ${totalApplied === 0 ? 'opacity-40' : 'opacity-10'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Applied</p>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{totalApplied}</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className={`rounded-xl border bg-card p-6 shadow-sm transition-opacity ${inProgress === 0 ? 'opacity-40' : 'opacity-10'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Progress</p>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{inProgress}</span>
          </div>
        </div>

        {/* Offers Secured Card */}
        <div className={`rounded-xl border bg-card p-6 shadow-sm transition-opacity ${offers === 0 ? 'opacity-40' : 'opacity-10'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Offers Secured</p>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{offers}</span>
          </div>
        </div>

        {/* Rejected Tracking Card */}
        <div className={`rounded-xl border bg-card p-6 shadow-sm transition-opacity ${rejected === 0 ? 'opacity-40' : 'opacity-10'}`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rejections</p>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{rejected}</span>
          </div>
        </div>

        {/* Premium Upcoming Interviews Amber Notification Card */}
        <div className={`rounded-xl border p-6 shadow-sm transition-all duration-200 ${
          upcomingInterviews === 0 
            ? 'border-border bg-card opacity-40' 
            : 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/10 shadow-amber-500/5'
        }`}>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">Interviews Upcoming</p>
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight">{upcomingInterviews}</span>
          </div>
        </div>
      </div>

      {/* Dual Visual Analytics Charting Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Chart Card 1: Applications by Status */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">Pipeline Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-1">Application distributions categorized by standard process phase.</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card 2: Chronological Processing Rate AreaChart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">Acquisition Over Time</h3>
            <p className="text-xs text-muted-foreground mt-1">Chronological frequency curves aggregated by initial application submission month.</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chronologicalData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;