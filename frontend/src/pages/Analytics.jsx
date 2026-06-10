import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  // 1. Fetch the raw list of applications
  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data; // This is an array of applications
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
    return <div className="p-8 text-center text-red-500">Error resolving analytics metrics parameters.</div>;
  }

  // 2. Derive analytics directly from the raw applications array.
  // This ensures 100% accuracy based on the actual database records.
  const total = applications?.length || 0;
  
  // Define statuses based on your database string values
  const counts = {
    APPLIED: applications?.filter(a => a.status === 'APPLIED').length || 0,
    SCREENING: applications?.filter(a => a.status === 'SCREENING').length || 0,
    INTERVIEW: applications?.filter(a => a.status === 'INTERVIEW').length || 0,
    OFFER: applications?.filter(a => a.status === 'OFFER').length || 0,
    REJECTED: applications?.filter(a => a.status === 'REJECTED').length || 0,
  };

  const distribution = [
    { label: 'Applied Stage', count: counts.APPLIED, color: 'bg-blue-500' },
    { label: 'Screening Routine', count: counts.SCREENING, color: 'bg-amber-500' },
    { label: 'Interview Process', count: counts.INTERVIEW, color: 'bg-purple-500' },
    { label: 'Offer Sheet Issued', count: counts.OFFER, color: 'bg-green-500' },
    { label: 'Rejected Clearance', count: counts.REJECTED, color: 'bg-red-500' },
  ];

  return (
    <div className="p-8 space-y-8 min-h-screen bg-background text-foreground transition-colors duration-300 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed metrics, conversion ratios, and pipeline health parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage Status Distribution Block */}
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <PieChart className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-card-foreground">Current Funnel Distribution</h3>
          </div>
          <div className="space-y-3">
            {distribution.map((row, idx) => {
              const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>{row.label} ({row.count})</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Performance Summary Box */}
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-bold text-card-foreground">Performance Summary Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your tracking dashboard history loop shows that you currently have{' '}
              <strong className="text-foreground font-semibold">{counts.INTERVIEW} interviews</strong> scheduled. Keep pushing!
            </p>
          </div>
          <div className="p-3 bg-muted border border-border rounded-lg flex items-start gap-2.5 text-xs text-muted-foreground mt-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Metrics synchronize instantly whenever individual application parameters undergo mutation updates.</span>
          </div>
        </div>
      </div>
    </div>
  );
}