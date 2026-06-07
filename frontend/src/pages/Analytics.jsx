import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['analyticsStats'],
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error resolving analytics metrics parameters ledger.</div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pipeline Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed metrics, conversion ratios, and pipeline health parameters tracking metrics ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage Status Distribution Block */}
        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Current Funnel Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Applied Stage', count: stats?.appliedCount || 0, color: 'bg-blue-500' },
              { label: 'Screening Routine', count: stats?.screeningCount || 0, color: 'bg-amber-500' },
              { label: 'Interview Process', count: stats?.interviewsCount || 0, color: 'bg-purple-500' },
              { label: 'Offer Sheet Issued', count: stats?.offersCount || 0, color: 'bg-green-500' },
              { label: 'Rejected Clearance', count: stats?.rejectedCount || 0, color: 'bg-red-500' },
            ].map((row, idx) => {
              const max = stats?.totalApplications || 1;
              const pct = Math.round((row.count / max) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{row.label} ({row.count})</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Performance Summary Box */}
        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-slate-900">Performance Summary Insights</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your tracking dashboard history loop shows that you currently have{' '}
              <strong className="text-slate-900 font-semibold">{stats?.upcomingInterviews || 0} interviews</strong> scheduled. Keep pushing!
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2.5 text-xs text-slate-500 mt-4">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Metrics synchronize instantly whenever individual application parameters undergo mutation updates.</span>
          </div>
        </div>
      </div>
    </div>
  );
}