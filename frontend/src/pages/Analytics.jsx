import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Briefcase, CheckCircle2, TrendingUp, Award } from 'lucide-react';

const COLORS = {
  APPLIED: '#3b82f6',   // Blue
  SCREENING: '#f59e0b', // Amber
  INTERVIEW: '#a855f7', // Purple
  OFFER: '#10b981',     // Emerald
  REJECTED: '#ef4444',  // Red
};

export default function Analytics() {
  // Pull directly from your primary synchronized cache channel
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: api.applications.getAll,
  });

  // 1. Structural calculations engine
  const totalApps = applications.length;
  
  const statusCounts = applications.reduce((acc, app) => {
    const status = (app.status || 'APPLIED').toUpperCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { APPLIED: 0, SCREENING: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 });

  // Convert schema object into charting streams
  const chartData = Object.keys(statusCounts).map(key => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    count: statusCounts[key],
    statusKey: key
  }));

  // Calculate critical metric conversion equations
  const interviewCount = statusCounts.INTERVIEW + statusCounts.OFFER; // Roles that made it to interview stage
  const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;
  const offerRate = totalApps > 0 ? Math.round((statusCounts.OFFER / totalApps) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full bg-slate-100" />)}
        </div>
        <Skeleton className="h-[300px] w-full bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pipeline Analytics</h2>
        <p className="text-sm text-slate-500">Live conversation metrics and funnel performance insights.</p>
      </div>

      {/* KPI High Density Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tracked</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalApps}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg"><Briefcase className="h-5 w-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Interviews</p>
            <h3 className="text-2xl font-bold text-purple-900 mt-1">{statusCounts.INTERVIEW}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Offers Secured</p>
            <h3 className="text-2xl font-bold text-emerald-900 mt-1">{statusCounts.OFFER}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg"><Award className="h-5 w-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Funnel Conversion</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{interviewRate}%</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
        </div>
      </div>

      {/* Graphical Breakdown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Volume Distribution by Stage</h4>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.statusKey] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Health Evaluation Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Funnel Health Summary</h4>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Application to Interview Rate</span>
                  <span>{interviewRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full transition-all" style={{ width: `${interviewRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Application to Offer Success</span>
                  <span>{offerRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${offerRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-6 text-xs text-slate-500 leading-relaxed">
                <strong>Funnel Tip:</strong> If your Application to Interview rate drops below 15%, prioritize revising your resume core keywords or focusing more heavily on direct cold outreach referrals.
          </div>
        </div>
      </div>
    </div>
  );
}