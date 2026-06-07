/**
 * Computes a human-readable countdown relative to the current calendar date calendar day bounds.
 * @param {string} dateString ISO style date string (YYYY-MM-DD)
 * @returns {"Today" | "Tomorrow" | "In N days" | "Overdue"}
 */
export function getCountdown(dateString) {
  if (!dateString) return '';
  
  // Strip out hours/minutes/seconds to calculate pure midnight-to-midnight boundary deltas
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / msPerDay);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Overdue';
  return `In ${diffDays} days`;
}