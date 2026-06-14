import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Calendar, Building2, Briefcase, FileText, CheckCircle2, Clock, ChevronLeft, Circle, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STEPS = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [interviewForm, setInterviewForm] = useState({ 
    date: '', time: '', round: 'TECHNICAL', format: 'Zoom/Meet', notes: '' 
  });

  const { data: app, isLoading, isError } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.applications.getOne(id)
  });

  const updateAppMutation = useMutation({
    mutationFn: (updatedFields) => api.applications.update(id, updatedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      toast.success('Application parameters synchronized successfully');
    }
  });

  const addInterviewMutation = useMutation({
    mutationFn: (newInterview) => api.interviews.create(id, newInterview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      setInterviewForm({ date: '', time: '', round: 'TECHNICAL', format: 'Zoom/Meet', notes: '' });
      toast.success('Interview row appended to timeline');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to log interview details');
    }
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: (interviewId) => api.interviews.delete(interviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingInterviews'] });
      toast.success('Interview successfully removed');
    },
    onError: () => {
      toast.error('Failed to delete interview');
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Resolving application parameters...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to find application mapping structures.</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(app.status);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(app.updatedAt));

  const handleInterviewSubmit = (e) => {
    e.preventDefault();
    if (!interviewForm.date || !interviewForm.time) {
      toast.error('Date and time inputs are required.');
      return;
    }
    const isoDateTime = `${interviewForm.date}T${interviewForm.time}:00`;
    addInterviewMutation.mutate({ ...interviewForm, date: new Date(isoDateTime).toISOString() });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6 min-h-screen bg-background text-foreground transition-colors duration-300 animate-in fade-in duration-200">
      
      <Button 
        variant="ghost" 
        onClick={() => navigate('/applications')}
        className="text-muted-foreground hover:text-foreground -ml-3 flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Tracked Roles
      </Button>

      {/* 4-Step Visual Timeline */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        {STATUS_STEPS.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1 min-w-[60px]">
            <div className={`p-2 rounded-full ${index <= currentStepIndex ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {index <= currentStepIndex ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
            </div>
            <span className="text-xs mt-2 font-bold uppercase tracking-wider text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-2xl font-black text-foreground">{app.company}</h1>
              </div>
              <div className="w-full sm:w-36">
                <Select value={app.status} onValueChange={(newStatus) => updateAppMutation.mutate({ status: newStatus })}>
                  <SelectTrigger className="w-full bg-background font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPLIED">Applied</SelectItem>
                    <SelectItem value="SCREENING">Screening</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="OFFER">Offer</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role Title</label>
              <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Briefcase className="h-4 w-4 text-muted-foreground" /> {app.role}
              </p>
            </div>
            
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last updated: {formattedDate}</p>

            <div className="pt-4 border-t border-border space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Core Tracking Context Notes
              </label>
              <textarea
                className="w-full min-h-[100px] border border-border rounded-lg p-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                placeholder="Type compensation targets, interviewer names, or application metrics. Click outside the box to auto-save."
                defaultValue={app.notes || ''}
                onBlur={(e) => updateAppMutation.mutate({ notes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" /> Scheduled Stages Pipeline
            </h2>
            {!app.interviews || app.interviews.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted p-6 rounded-lg border border-border text-center">
                No dynamic process components tracked yet for this employment card context.
              </p>
            ) : (
              <div className="space-y-3">
                {app.interviews.map((interview) => (
                  <div key={interview.id} className="border border-border rounded-xl p-4 bg-muted/50 flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold bg-muted-foreground/20 text-foreground px-2 py-0.5 rounded tracking-wide uppercase">{interview.round}</span>
                        <span className="text-[10px] font-extrabold bg-primary/20 text-primary px-2 py-0.5 rounded tracking-wide uppercase">{interview.format}</span>
                        <p className="text-sm font-bold text-foreground">
                          {new Date(interview.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {interview.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{interview.notes}"</p>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {interview.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500 animate-pulse" />}
                      <button 
                        onClick={() => deleteInterviewMutation.mutate(interview.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Schedule Interview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Append an upcoming evaluation timestamp loop onto your tracking cards.</p>
          </div>
          <form onSubmit={handleInterviewSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Date</label>
              <input type="date" className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring" value={interviewForm.date} onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Time</label>
              <Input type="text" placeholder="e.g. 14:00 " className="bg-background" value={interviewForm.time} onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Round Classification</label>
              <Select value={interviewForm.round} onValueChange={(val) => setInterviewForm({...interviewForm, round: val})}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHONE">Phone Screen</SelectItem>
                  <SelectItem value="TECHNICAL">Technical Round</SelectItem>
                  <SelectItem value="BEHAVIORAL">Behavioral Fit</SelectItem>
                  <SelectItem value="MANAGEMENT">Manager / Director</SelectItem>
                  <SelectItem value="ONSITE">Onsite Loop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview Format</label>
              <Select value={interviewForm.format} onValueChange={(val) => setInterviewForm({...interviewForm, format: val})}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoom/Meet">Online (Zoom/Meet)</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="In-Person">In-Person (On-site)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus Notes</label>
              <Input type="text" placeholder="Panelists, topics..." className="bg-background" value={interviewForm.notes} onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})} />
            </div>
            <Button type="submit" disabled={addInterviewMutation.isPending} className="w-full mt-2">
              {addInterviewMutation.isPending ? 'Logging...' : 'Log Meeting Row'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}