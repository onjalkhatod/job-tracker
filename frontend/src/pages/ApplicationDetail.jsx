import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { getCountdown } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, Check, CheckCircle2, Video, Phone, MapPin } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Query 1: Fetch core info
  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/applications/${id}`, { headers });
      return res.data;
    }
  });

  // Query 2: Fetch corresponding interview slots array
  const { data: interviews = [], isLoading: intLoading } = useQuery({
    queryKey: ['interviews', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/applications/${id}/interviews`, { headers });
      return res.data;
    }
  });

  // Complete status modification mutation block
  const completeMutation = useMutation({
    mutationFn: async (interviewId) => {
      await axios.put(`http://localhost:5000/api/interviews/${interviewId}`, { completed: true }, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews', id] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      toast.success('Stage marked as completed successfully');
    }
  });

  if (appLoading || intLoading) {
    return (
      <div className="p-8 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tracked Roles
      </Link>

      <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{application?.company}</h1>
            <p className="text-lg text-slate-500 font-medium mt-0.5">{application?.role}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-50 border-slate-200 text-slate-700">
            {application?.status}
          </span>
        </div>
        {application?.notes && (
          <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{application.notes}</p>
        )}
      </div>

      {/* Interview Agenda Tracking Block Stack Component Layout */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" /> Scheduled Stages Pipeline
        </h3>

        {interviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center border border-dashed rounded-xl bg-slate-50/50">
            No dynamic process components tracked yet for this employment card context.
          </p>
        ) : (
          <div className="space-y-3">
            {interviews.map((item) => {
              const countdown = getCountdown(item.date);
              const isOverdue = countdown === 'Overdue';

              return (
                <div 
                  key={item.id} 
                  className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
                    item.completed 
                      ? 'bg-slate-50/60 border-slate-100 opacity-65 select-none' 
                      : 'bg-white border-slate-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg mt-0.5 ${item.completed ? 'bg-slate-100 text-slate-400' : 'bg-purple-50 text-purple-600'}`}>
                      {item.format === 'Video' ? <Video className="h-4 w-4" /> : item.format === 'Phone' ? <Phone className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-bold text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.round}</h4>
                        {item.completed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {countdown}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {new Date(item.date).toLocaleDateString()} at {item.time} — <span className="italic">{item.format} Session</span>
                      </p>
                      {item.location && !item.completed && (
                        <p className="text-xs text-purple-600 font-semibold mt-1 break-all max-w-md">{item.location}</p>
                      )}
                    </div>
                  </div>

                  {!item.completed && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => completeMutation.mutate(item.id)}
                      className="h-8 text-xs font-semibold shrink-0 gap-1 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Check className="h-3.5 w-3.5 text-green-600" /> Mark as Done
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}