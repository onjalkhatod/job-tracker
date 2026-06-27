/**
 * Computes a human-readable countdown relative to the current calendar date calendar day bounds.
 * @param {string} dateString 
 * @returns {"Today" | "Tomorrow" | "In N days" | "Overdue" | ""}
 */
export function getCountdown(dateString) {
  if (!dateString) return '';

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / msPerDay);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  return 'Overdue';
}