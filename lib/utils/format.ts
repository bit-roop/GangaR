const OPERATIONAL_TIME_ZONE = "Asia/Kolkata";

function parseLegacyIstDate(value: string) {
  const match = value.match(
    /^(\d{1,2})\s([A-Za-z]{3})\s(\d{4}),\s(\d{1,2}):(\d{2})\s(AM|PM)\sIST$/
  );

  if (!match) return null;

  const [, day, monthLabel, year, hourLabel, minute, meridiem] = match;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = months.indexOf(monthLabel);

  if (monthIndex === -1) return null;

  let hour = Number(hourLabel);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const utcMillis = Date.UTC(Number(year), monthIndex, Number(day), hour - 5, Number(minute) - 30);
  return new Date(utcMillis);
}

function parseOperationalDate(value: string) {
  const utcWithoutZone = value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/);
  if (utcWithoutZone) {
    const isoDate = new Date(`${value}Z`);
    if (!Number.isNaN(isoDate.getTime())) return isoDate;
  }

  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  return parseLegacyIstDate(value);
}

export function formatOperationalDateTime(value: string, timeZone?: string) {
  const parsed = parseOperationalDate(value);
  if (!parsed) return value;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone ?? OPERATIONAL_TIME_ZONE
  });

  const parts = formatter.formatToParts(parsed);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value.toUpperCase() ?? "";

  return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
}

export function formatOperationalTime(value: string, timeZone?: string) {
  const parsed = parseOperationalDate(value);
  if (!parsed) return value;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone ?? OPERATIONAL_TIME_ZONE
  });

  const parts = formatter.formatToParts(parsed);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value.toUpperCase() ?? "";

  return `${hour}:${minute} ${dayPeriod} IST`;
}

export function getCurrentUtcIsoTimestamp() {
  return new Date().toISOString();
}

export function formatTimestamp(value: string) {
  return formatOperationalDateTime(value);
}

export function getOperationalTimestampValue(value: string) {
  const parsed = parseOperationalDate(value);
  return parsed?.getTime() ?? 0;
}

export function formatPopulation(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatDischarge(value: number) {
  return `${new Intl.NumberFormat("en-IN").format(value)} m³/s`;
}
