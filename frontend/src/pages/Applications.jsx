import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { getCountdown } from '@/lib/dateUtils';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// ➕ Added Dialog imports for our input form layout modal container
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Briefcase, Search, Filter, CalendarClock, ExternalLink, AlertOctagon, Plus } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/applications';

const statusColors = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  SCREENING: 'bg-amber-50 text-amber-700 border-amber-200',
  INTERVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
  OFFER: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function Applications() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ➕ Form State Configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', role: '', status: 'APPLIED', notes: '' });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // ➕ Create Record Asynchronous Mutation Function
  const createMutation = useMutation({
    mutationFn: async (newApp) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(API_URL, newApp, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      setIsModalOpen(false);
      setFormData({ company: '', role: '', status: 'APPLIED', notes: '' });
      toast.success('New role successfully logged to ledger');
    },
    onError: () => {
      toast.error('Failed to register application details');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      toast.success('Application profile safely flushed');
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      toast.error('Company identity and role fields are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.company.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => <Skeleton key={n} className="h-44 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-16 max-w-md mx-auto text-center space-y-4 animate-in fade-in duration-200">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <AlertOctagon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Pipeline Sync Failure</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            We ran into an authentication mismatch or network issue while trying to load your tracked roles ledger matrix.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['applications'] })}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Retry Connection Stream
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Action Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Tracked Roles</h1>
          <p className="text-muted-foreground mt-1">Refine and filter your ongoing opportunities.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="SCREENING">Screening</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="OFFER">Offer</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ➕ Mounted Add Application Trigger Button Element */}
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-slate-900/10"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Add Application
          </Button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-slate-50/50">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No matching items resolved</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const nextUpcoming = app.interviews?.find(i => !i.completed && i.date >= todayStr);
            
            const countdownText = nextUpcoming ? getCountdown(nextUpcoming.date) : null;
            const isToday = countdownText === 'Today';

            return (
              <div 
                key={app.id} 
                className={`group border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  isToday ? 'border-l-4 border-l-amber-500' : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                        {app.company}
                        <Link to={`/applications/${app.id}`} className="text-slate-400 hover:text-slate-900 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </h3>
                      <p className="text-slate-500 font-semibold text-sm mt-0.5">{app.role}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  {nextUpcoming && (
                    <div className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
                      isToday 
                        ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse' 
                        : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      <CalendarClock className={`h-4 w-4 ${isToday ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>
                        {isToday ? `Interview today — ${nextUpcoming.time}` : `${countdownText} (${nextUpcoming.round})`}
                      </span>
                    </div>
                  )}

                  {app.notes && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                      {app.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t mt-5 pt-4 text-xs text-slate-400">
                  <span>Added {new Date(app.createdAt).toLocaleDateString()}</span>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Flush tracking row record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all associated processes for <strong className="text-slate-900 font-bold">{app.company}</strong> permanently.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(app.id)} className="bg-red-600 hover:bg-red-700 text-white">
                          Confirm Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ➕ Integrated Shadow Form Capture Dialog Shell */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-slate-900">Track New Position</DialogTitle>
            <DialogDescription>
              Register ongoing employment metrics to aggregate pipeline charting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Identity</label>
              <Input 
                type="text" 
                placeholder="e.g. Stripe, Google" 
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Title</label>
              <Input 
                type="text" 
                placeholder="e.g. Frontend Engineer" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Stage Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="bg-white">
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
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Context Notes (Optional)</label>
              <Input 
                type="text" 
                placeholder="Salary, tech stack, or points of interest..." 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Dismiss
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-slate-900 text-white hover:bg-slate-800">
                {createMutation.isPending ? 'Logging data...' : 'Commit Position'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}