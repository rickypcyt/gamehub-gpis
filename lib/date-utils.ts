/**
 * Capitalize the first letter of a month name for Spanish locale
 * JavaScript's toLocaleDateString returns lowercase months in Spanish (e.g., "agosto")
 * This function capitalizes the first letter (e.g., "Agosto")
 */
export function capitalizeMonth(dateString: string, localeTag: string): string {
  // Capitalize first letter for Spanish locale
  if (localeTag === "es-ES") {
    return dateString.charAt(0).toUpperCase() + dateString.slice(1);
  }
  return dateString;
}
