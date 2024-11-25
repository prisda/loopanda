import { format } from 'date-fns';

export function formatDate(timestamp: any): string {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle different timestamp formats
    if (timestamp.toDate) {
      // Firebase Timestamp
      return format(timestamp.toDate(), 'MMM d, yyyy');
    } else if (timestamp.seconds) {
      // Firebase Timestamp as plain object
      return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy');
    } else if (timestamp instanceof Date) {
      // JavaScript Date object
      return format(timestamp, 'MMM d, yyyy');
    } else if (typeof timestamp === 'string') {
      // ISO string or other date string
      return format(new Date(timestamp), 'MMM d, yyyy');
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      return format(new Date(timestamp), 'MMM d, yyyy');
    }
    
    return 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}