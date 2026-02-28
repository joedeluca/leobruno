// Format date from YYYY-MM-DD to "Saturday, Aug 24, 2024"
export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00") // Add time to avoid timezone issues

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}

// Format date from YYYY-MM-DD to "January 11, 2026" for article bylines
export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00") // Add time to avoid timezone issues

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}

// Format date from YYYY-MM-DD to "Feb 28" for compact/mobile bylines
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00")

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}
