/**
 * Formats a date string into a readable date format
 * GraphQL returns dates as ISO strings, but sometimes they might need special handling
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return 'Unknown date';
  }

  try {
    // Parse the date - if it's a timestamp, convert to number first
    const date = isNaN(Number(dateString)) ? new Date(dateString) : new Date(Number(dateString));

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString();
  } catch (error) {
    return 'Error formatting date';
  }
}

/**
 * Formats a date string into a readable date and time format
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) {
    return 'Unknown date';
  }

  try {
    // Parse the date - if it's a timestamp, convert to number first
    const date = isNaN(Number(dateString)) ? new Date(dateString) : new Date(Number(dateString));

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString();
  } catch (error) {
    return 'Error formatting date';
  }
}
