import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Building2, Briefcase, FileText, Plus, CheckCircle2, Clock, ChevronLeft, Circle, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Pipeline sequence definition
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
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const updateAppMutation = useMutation({
    mutationFn: async (updatedFields) => {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/applications/${id}`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      toast.success('Application parameters synchronized successfully');
    }
  });

  const addInterviewMutation = useMutation({
    mutationFn: async (newInterview) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/applications/${id}/interviews`, newInterview, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      setInterviewForm({ date: '', time: '', round: 'TECHNICAL', format: 'Zoom/Meet', notes: '' });
      toast.success('Interview row appended to timeline');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to log interview details');
    }
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: async (interviewId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/interviews/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // 1. Refresh the specific application data (for the detail page)
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      
      // 2. CRITICAL: Refresh the upcoming interviews list (for the dashboard)
      queryClient.invalidateQueries({ queryKey: ['upcomingInterviews'] });
      
      toast.success('Interview successfully removed');
    },
    onError: () => {
      toast.error('Failed to delete interview');
    }
  });
  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Resolving application parameters...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to find application mapping structures.</div>;

  // 🎯 NEW: Timeline Index & Formatted Date
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
  
  const payload = { 
    ...interviewForm, 
    date: new Date(isoDateTime).toISOString() 
  };

  addInterviewMutation.mutate(payload);
};
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      <Button 
        variant="ghost" 
        onClick={() => navigate('/applications')}
        className="text-slate-500 hover:text-slate-900 -ml-3 flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Tracked Roles
      </Button>

      {/* 🎯 NEW: 4-Step Visual Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
        {STATUS_STEPS.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className={`p-2 rounded-full ${index <= currentStepIndex ? 'text-green-600' : 'text-slate-300'}`}>
              {index <= currentStepIndex ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
            </div>
            <span className="text-xs mt-2 font-bold uppercase tracking-wider">{step}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-slate-700" />
                <h1 className="text-2xl font-black text-slate-900">{app.company}</h1>
              </div>
              <div className="w-36">
                <Select value={app.status} onValueChange={(newStatus) => updateAppMutation.mutate({ status: newStatus })}>
                  <SelectTrigger className="w-full bg-slate-50 font-semibold border-slate-200">
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role Title</label>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="h-4 w-4 text-slate-400" /> {app.role}
              </p>
            </div>
            
            {/* 🎯 NEW: Formatted Last Updated Date */}
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Last updated: {formattedDate}</p>

            <div className="pt-4 border-t space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Core Tracking Context Notes
              </label>
              <textarea
                className="w-full min-h-[100px] border border-slate-200 rounded-lg p-3 text-sm text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                placeholder="Type compensation targets, interviewer names, or application metrics. Click outside the box to auto-save."
                defaultValue={app.notes || ''}
                onBlur={(e) => updateAppMutation.mutate({ notes: e.target.value })}
              />
            </div>
          </div>
          
          {/* ... [Rest of your existing Interview Pipeline UI code here] ... */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" /> Scheduled Stages Pipeline
            </h2>
            {!app.interviews || app.interviews.length === 0 ? (
              <p className="text-sm text-slate-400 bg-slate-50 p-6 rounded-lg border border-dashed text-center">
                No dynamic process components tracked yet for this employment card context.
              </p>
            ) : (
              <div className="space-y-3">
                {app.interviews.map((interview) => (
                  <div key={interview.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold bg-slate-200 text-slate-800 px-2 py-0.5 rounded tracking-wide uppercase">{interview.round}</span>
                        <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded tracking-wide uppercase">{interview.format}</span>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(interview.date).toLocaleDateString('en-IN')} at{' '}
                          {new Intl.DateTimeFormat('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          }).format(new Date(interview.date))}
                        </p>
                      </div>
                      {interview.notes && <p className="text-xs text-slate-500 italic mt-0.5">"{interview.notes}"</p>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {interview.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500 animate-pulse" />}
                      
                      {/* 🎯 NEW DELETE BUTTON */}
                      <button 
                        onClick={() => deleteInterviewMutation.mutate(interview.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Delete Interview"
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

        {/* ... [Schedule Interview Form stays here as is] ... */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Schedule Interview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Append an upcoming evaluation timestamp loop straight onto your tracking cards ledger.</p>
          </div>
          <form onSubmit={handleInterviewSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Date</label>
              <input type="date" className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900" value={interviewForm.date} onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Time</label>
              <Input type="text" placeholder="e.g. 14:00 " className="bg-white border-slate-200" value={interviewForm.time} onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Round Classification</label>
              <Select value={interviewForm.round} onValueChange={(val) => setInterviewForm({...interviewForm, round: val})}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Interview Format</label>
              <Select value={interviewForm.format} onValueChange={(val) => setInterviewForm({...interviewForm, format: val})}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoom/Meet">Online (Zoom/Meet)</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="In-Person">In-Person (On-site)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Focus Notes</label>
              <Input type="text" placeholder="Panelists, topics, or index pointers..." className="bg-white border-slate-200" value={interviewForm.notes} onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})} />
            </div>
            <Button type="submit" disabled={addInterviewMutation.isPending} className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center justify-center gap-1.5 mt-2">
              <Plus className="h-4 w-4 stroke-[3]" /> {addInterviewMutation.isPending ? 'Logging Meeting...' : 'Log Meeting Row'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}             