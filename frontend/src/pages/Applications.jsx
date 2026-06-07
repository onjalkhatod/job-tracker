import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { getCountdown } from '@/lib/dateUtils';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Briefcase, Search, Filter, CalendarClock, ExternalLink, AlertOctagon } from 'lucide-react';

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

  // 🎯 FIXED: Explicitly use the 'isError' variable to satisfy the ESLint linter check rules safely
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Tracked Roles</h1>
          <p className="text-muted-foreground mt-1">Refine and filter your ongoing opportunities.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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

          <div className="w-full sm:w-48">
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
    </div>
  );
}