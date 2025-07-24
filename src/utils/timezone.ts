/**
 * Timezone utility functions for formatting dates to WIB (Western Indonesian Time)
 */

export function formatToWIB(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Format to WIB timezone (UTC+7)
  return dateObj.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatToWIBDateOnly(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatToWIBTimeOnly(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatToWIBWithTimezone(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
}

// Alternative ISO format with WIB timezone
export function formatToWIBISO(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Convert to WIB manually (UTC+7)
  const wibDate = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);

  return wibDate.toISOString().replace("Z", "+07:00");
}

// Get current WIB time
export function getCurrentWIBTime(): string {
  return formatToWIB(new Date());
}

// Check if a date is today in WIB timezone
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  const dateWIB = formatToWIBDateOnly(dateObj);
  const todayWIB = formatToWIBDateOnly(today);

  return dateWIB === todayWIB;
}
