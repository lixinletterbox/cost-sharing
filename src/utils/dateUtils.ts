/**
 * Safely formats a date string (YYYY-MM-DD or ISO) to a local display string
 * without timezone shifting.
 */
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // If it's a YYYY-MM-DD format (common from database DATE type or form input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Passing year, month-1, day to Date constructor creates a local date
    return new Date(year, month - 1, day).toLocaleDateString();
  }
  
  // Fallback for other formats (like full ISO)
  return new Date(dateStr).toLocaleDateString();
};

/**
 * Returns the current local date in YYYY-MM-DD format.
 */
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
