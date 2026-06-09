export const getCountdown = (dateString) => {
  const targetDate = new Date(dateString);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDateOnly = new Date(targetDate);
  targetDateOnly.setHours(0, 0, 0, 0);
  const diffTime = targetDateOnly - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  return "Past";
};