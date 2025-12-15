/**
 * Formats a time string or Date object into a human-readable clock format
 * Removes trailing zeros and formats as "H:MM AM/PM" or "HH:MM AM/PM"
 * 
 * @param time - Time string (ISO format) or Date object
 * @returns Formatted time string (e.g., "2:30 PM", "11:45 AM")
 */
export function formatTime(time: string | Date | null | undefined): string {
  if (!time) return '';
  
  try {
    const date = typeof time === 'string' ? new Date(time) : time;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as 12-hour time with AM/PM, removing leading zeros from hours
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Formats a date string or Date object into a readable date format
 * 
 * @param date - Date string (ISO format) or Date object
 * @returns Formatted date string (e.g., "Dec 25, 2025")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formats a date and time range
 * 
 * @param startTime - Start time string or Date
 * @param endTime - End time string or Date (optional)
 * @returns Formatted time range (e.g., "2:30 PM - 4:00 PM")
 */
export function formatTimeRange(
  startTime: string | Date | null | undefined,
  endTime?: string | Date | null | undefined
): string {
  const start = formatTime(startTime);
  if (!start) return '';
  
  if (endTime) {
    const end = formatTime(endTime);
    if (end) {
      return `${start} - ${end}`;
    }
  }
  
  return start;
}

