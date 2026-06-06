import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApplicationForm({ open, onOpenChange, applicationToEdit = null }) {
  const queryClient = useQueryClient();
  const isEditMode = !!applicationToEdit;

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    status: "APPLIED",
    url: "",
    dateApplied: new Date().toISOString().split("T")[0],
    notes: ""
  });

  // Safe side-effect processing using microtask framing
  useEffect(() => {
    if (!open) return; // Only process layout configurations when modal forces visibility

    // requestAnimationFrame deferral pushes the setState execution safely outside the Dialog lifecycle loop
    const frameId = requestAnimationFrame(() => {
      if (isEditMode && applicationToEdit) {
        setFormData({
          company: applicationToEdit.company || "",
          position: applicationToEdit.position || "",
          location: applicationToEdit.location || "",
          status: (applicationToEdit.status || "APPLIED").toUpperCase(),
          url: applicationToEdit.url || "",
          dateApplied: applicationToEdit.dateApplied 
            ? new Date(applicationToEdit.dateApplied).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          notes: applicationToEdit.notes || ""
        });
      } else {
        setFormData({
          company: "",
          position: "",
          location: "",
          status: "APPLIED",
          url: "",
          dateApplied: new Date().toISOString().split("T")[0],
          notes: ""
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [applicationToEdit, isEditMode, open]);

  // Mutation 1: POST Pipeline (Create)
  const createMutation = useMutation({
    mutationFn: (newJob) => api.applications.create(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onOpenChange(false);
    },
  });

  // Mutation 2: PUT Pipeline (Update)
  const updateMutation = useMutation({
    mutationFn: (updatedJob) => {
      // Safely check for either id convention structure
      const targetId = applicationToEdit?.id || applicationToEdit?._id;
      return api.applications.update(targetId, updatedJob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-50">
            {isEditMode ? "Edit Application" : "Track New Role"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {isEditMode 
              ? "Modify current job parameter boundaries and timeline steps." 
              : "Log tracking criteria for an active or submitted job opportunity."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Company *</label>
            <input
              type="text"
              required
              placeholder="e.g. Stripe, OpenAI"
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-sm text-slate-900 dark:text-slate-50 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role / Position *</label>
            <input
              type="text"
              required
              placeholder="e.g. Frontend Lead"
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-sm text-slate-900 dark:text-slate-50 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="SCREENING">Screening</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date Applied</label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1 text-sm focus:ring-1 focus:ring-slate-900 focus:outline-none bg-transparent text-slate-900 dark:text-slate-50"
                value={formData.dateApplied}
                onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Job Posting Link</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-sm text-slate-900 dark:text-slate-50 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Internal Notes</label>
            <Textarea
              placeholder="Add key highlights or recruiter contact points..."
              className="resize-none min-h-[80px] border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-50"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 min-w-[100px]">
              {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}