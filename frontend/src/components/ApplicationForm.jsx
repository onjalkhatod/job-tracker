import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Trash2, CalendarDays } from 'lucide-react';

export default function ApplicationForm({ application, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!application;

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      company: application?.company || '',
      role: application?.role || '',
      status: application?.status || 'APPLIED',
      notes: application?.notes || '',
      interviews: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'interviews'
  });

  const currentStatus = useWatch({
    control,
    name: 'status',
    defaultValue: application?.status || 'APPLIED'
  });
  
  const showInterviewSection = currentStatus === 'SCREENING' || currentStatus === 'INTERVIEW';

  const fieldsLengthRef = useRef(fields.length);
  useEffect(() => {
    fieldsLengthRef.current = fields.length;
  }, [fields.length]);

  useEffect(() => {
    if (showInterviewSection && fieldsLengthRef.current === 0) {
      append({ date: '', time: '', round: 'TECHNICAL', format: 'ONLINE', location: '' });
    }
  }, [showInterviewSection, append]);

  const onSubmit = async (formData) => {
    try {
      let appId = application?.id;

      if (isEditing) {
        await api.applications.update(appId, {
          company: formData.company,
          role: formData.role,
          status: formData.status,
          notes: formData.notes
        });
      } else {
        const appRes = await api.applications.create({
          company: formData.company,
          role: formData.role,
          status: formData.status,
          notes: formData.notes
        });
        appId = appRes.id;
      }

      if (showInterviewSection && formData.interviews?.length > 0) {
        const validInterviews = formData.interviews.filter(i => i.date && i.time);
        for (const interview of validInterviews) {
          await fetch(`${BASE_URL}/applications/${appId}/interviews`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(interview)
          });
        }
      }

      toast.success(isEditing ? 'Application records updated' : 'Job application tracked cleanly');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Pipeline operation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-2 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Company</label>
          <Input {...register('company', { required: 'Required field' })} />
          {errors.company && <p className="text-xs text-destructive mt-1">{errors.company.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Role Title</label>
          <Input {...register('role', { required: 'Required field' })} />
          {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Pipeline Progress Status</label>
        <Select defaultValue={currentStatus} onValueChange={(val) => setValue('status', val, { shouldValidate: true })}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select current phase" />
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

      {showInterviewSection && (
        <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Schedule Stage Rounds</span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1"
              onClick={() => append({ date: '', time: '', round: 'TECHNICAL', format: 'ONLINE', location: '' })}
            >
              <Plus className="h-3 w-3" /> Add Round
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="p-3 bg-card border border-border rounded-lg space-y-3 relative group">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Date</label>
                  <Input type="date" className="h-8 text-xs" {...register(`interviews.${index}.date`, { required: true })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Time</label>
                  <Input type="text" placeholder="e.g. 2:00 PM" className="h-8 text-xs" {...register(`interviews.${index}.time`, { required: true })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Round Type</label>
                  <select className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none" {...register(`interviews.${index}.round`)}>
                    <option value="TECHNICAL">Technical Round</option>
                    <option value="HR">HR Screening</option>
                    <option value="BEHAVIORAL">Behavioral Round</option>
                    <option value="MANAGER">Manager Round</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Format</label>
                  <select className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none" {...register(`interviews.${index}.format`)}>
                    <option value="ONLINE">Online (Zoom/Meet)</option>
                    <option value="IN_PERSON">In Person (On-site)</option>
                    <option value="PHONE">Phone Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Location / Link (Optional)</label>
                <Input type="text" placeholder="Zoom Link or Room address" className="h-8 text-xs" {...register(`interviews.${index}.location`)} />
              </div>

              {fields.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="absolute right-2 top-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-md"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Additional Notes</label>
        <textarea 
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('notes')} 
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving changes...' : isEditing ? 'Update Application' : 'Save Tracked Entry'}
        </Button>
      </div>
    </form>
  );
}