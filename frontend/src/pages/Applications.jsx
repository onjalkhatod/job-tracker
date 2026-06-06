import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Briefcase, Building2, MapPin, ExternalLink, RefreshCw } from 'lucide-react';

// Strict color tokens mapping directly to spec requirement
const STATUS_BADGES = {
  APPLIED: "bg-blue-500/10 text-blue-500 border-blue-500/20 focus:ring-blue-500",
  SCREENING: "bg-amber-500/10 text-amber-500 border-amber-500/20 focus:ring-amber-500",
  INTERVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20 focus:ring-purple-500",
  OFFER: "bg-green-500/10 text-green-500 border-green-500/20 focus:ring-green-500",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20 focus:ring-red-500",
};

export default function Applications() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    status: 'APPLIED',
    url: ''
  });

  // 1. Fetch live application records
  const { data: applications = [], isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: api.applications.getAll,
  });

  // 2. Mutation pipeline to log a new job card
  const createMutation = useMutation({
    mutationFn: api.applications.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsFormOpen(false);
      setFormData({ company: '', position: '', location: '', status: 'APPLIED', url: '' });
    },
  });

  // 3. Mutation pipeline to update a job's status inline
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.applications.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  // 4. Mutation pipeline to clear a job card out
  const deleteMutation = useMutation({
    mutationFn: api.applications.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Upper Dashboard Header Section */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tracked Roles</h2>
          <p className="text-sm text-slate-500">Monitor and update your ongoing career opportunities pipeline.</p>
        </div>
        {!isLoading && applications.length > 0 && (
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 text-xs py-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> {isFormOpen ? 'Close Form' : 'Add Application'}
          </Button>
        )}
      </div>

      {/* Dynamic Creation Form Panel */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl shadow-sm flex flex-col gap-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">New Role Entry Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Company *</label>
              <input
                type="text" required placeholder="e.g. Google, Stripe"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Position / Title *</label>
              <input
                type="text" required placeholder="e.g. Frontend Engineer"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Job Location</label>
              <input
                type="text" placeholder="e.g. Remote, San Francisco"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Current Status</label>
              <select
                className="w-full rounded-md border border-slate-200 p-2 text-sm bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interviewing</option>
                <option value="OFFER">Offer Received</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Posting Link URL</label>
            <input
              type="url" placeholder="https://careers.company.com/job/123"
              className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full md:w-auto md:self-end bg-slate-900 hover:bg-slate-800 text-white mt-2 px-6"
          >
            {createMutation.isPending ? 'Logging Entry...' : 'Save Job Card'}
          </Button>
        </form>
      )}

      {/* Network Async Error Intercept Screen */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ Failed to resolve database pipeline: {error.message}
        </div>
      )}

      {/* Main Structural Layout States View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between h-[165px]">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-2 w-2/3">
                    <Skeleton className="h-5 w-full bg-slate-200/80" />
                    <Skeleton className="h-4 w-3/4 bg-slate-200/80" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80 shrink-0" />
                </div>
                <Skeleton className="h-3 w-1/2 bg-slate-200/80" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                <Skeleton className="h-4 w-24 bg-slate-200/80" />
                <Skeleton className="h-6 w-6 rounded bg-slate-200/80" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center border-2 border-dashed border-slate-200 rounded-lg py-16 px-4 bg-white">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No tracked opportunities logged yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            Keep your search organized. Log companies, response timelines, and stage transitions cleanly.
          </p>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" /> Add your first one
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => {
            const appStatusKey = (app.status || 'APPLIED').toUpperCase();
            return (
              <div 
                key={app.id} 
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {app.position}
                      </h4>
                      <p className="text-sm text-slate-600 font-medium flex items-center gap-1 mt-0.5 line-clamp-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {app.company}
                      </p>
                    </div>

                    <div className="relative flex items-center gap-1 shrink-0">
                      {updateStatusMutation.isPending && 
                       updateStatusMutation.variables?.id === app.id && (
                        <RefreshCw className="h-3 w-3 text-slate-400 animate-spin" />
                      )}
                      <select
                        value={appStatusKey}
                        onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border focus:outline-none focus:ring-2 cursor-pointer transition-all pr-1 bg-none ${STATUS_BADGES[appStatusKey] || "bg-slate-100"}`}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SCREENING">Screening</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFER">Offer</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {app.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {app.location}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                  {app.url ? (
                    <a 
                      href={app.url} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 group/link"
                    >
                      View Job Post <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No listing URL provided</span>
                  )}
                  
                  <button
                    onClick={() => {
                      if(confirm(`Remove tracking data for ${app.position} at ${app.company}?`)) {
                        deleteMutation.mutate(app.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="Delete job tracking block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}