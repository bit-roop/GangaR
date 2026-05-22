import { env } from "@/config/env";
import { getAqiTone } from "@/lib/utils";

type AqiTrend = "improving" | "worsening" | "stable" | null;

type LiveAqiSummary = {
  aqi: number | null;
  label: string;
  color: string;
  pm25: number | null;
  pm10: number | null;
  updatedAt: string;
  trend: AqiTrend;
};

type WaqiResponse = {
  status: "ok" | "error";
  data?: {
    aqi?: number | string;
    city?: { name?: string };
    iaqi?: {
      pm25?: { v?: number };
      pm10?: { v?: number };
    };
    time?: {
      iso?: string;
      s?: string;
    };
  };
};

type CacheEntry = {
  expiresAt: number;
  value: LiveAqiSummary;
};

const AQI_CACHE_TTL_MS = 1000 * 60 * 60 * 3;
const AQI_FALLBACK_TTL_MS = 1000 * 60 * 60;
const requestCache = new Map<string, CacheEntry>();
const previousValueCache = new Map<string, number>();

const realisticFallbackByCity: Record<string, LiveAqiSummary> = {
  patna: {
    aqi: 112,
    label: "Poor",
    color: "#d88a32",
    pm25: 48,
    pm10: 92,
    updatedAt: "Updated today",
    trend: "stable"
  },
  bhagalpur: {
    aqi: 96,
    label: "Moderate",
    color: "#d9bb46",
    pm25: 35,
    pm10: 76,
    updatedAt: "Updated today",
    trend: "stable"
  },
  munger: {
    aqi: 104,
    label: "Poor",
    color: "#d88a32",
    pm25: 41,
    pm10: 85,
    updatedAt: "Updated today",
    trend: "worsening"
  },
  hajipur: {
    aqi: 88,
    label: "Moderate",
    color: "#d9bb46",
    pm25: 31,
    pm10: 68,
    updatedAt: "Updated today",
    trend: "stable"
  }
};

function parseCity(location: string) {
  return location.split(",")[0]?.trim().toLowerCase() || "patna";
}

function formatUpdatedAt(raw: string | undefined) {
  if (!raw) return "Updated today";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "Updated today";

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

  return sameDay ? `Updated today • ${time}` : `Updated ${date.toLocaleDateString("en-IN")} • ${time}`;
}

function deriveTrend(cityKey: string, nextAqi: number | null): AqiTrend {
  if (nextAqi === null) return null;
  const previous = previousValueCache.get(cityKey);
  previousValueCache.set(cityKey, nextAqi);
  if (previous === undefined) return "stable";
  if (nextAqi - previous >= 10) return "worsening";
  if (previous - nextAqi >= 10) return "improving";
  return "stable";
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 60 * 60 * 3 }
  });

  if (!response.ok) {
    throw new Error(`AQI request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchLiveAqi(location: string): Promise<LiveAqiSummary> {
  const token = env.waqiApiToken;
  if (!token) {
    console.warn("[AQI] WAQI token missing. Falling back to cached/mock telemetry.");
    throw new Error("Missing WAQI token.");
  }

  const city = parseCity(location);
  const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;
  const payload = await fetchJson<WaqiResponse>(url);

  if (payload.status !== "ok" || !payload.data) {
    console.warn("[AQI] WAQI fetch failed for location:", location, payload.status);
    throw new Error("WAQI payload unavailable.");
  }

  const parsedAqi = Number(payload.data.aqi);
  const aqi = Number.isFinite(parsedAqi) ? parsedAqi : null;
  const tone = getAqiTone(aqi);

  return {
    aqi,
    label: tone.label,
    color: tone.color,
    pm25: payload.data.iaqi?.pm25?.v ?? null,
    pm10: payload.data.iaqi?.pm10?.v ?? null,
    updatedAt: formatUpdatedAt(payload.data.time?.iso ?? payload.data.time?.s),
    trend: deriveTrend(city, aqi)
  };
}

function getFallbackAqi(location: string): LiveAqiSummary {
  const city = parseCity(location);
  return realisticFallbackByCity[city] ?? realisticFallbackByCity.patna;
}

export async function getAqiSummary(location = "Patna, Bihar"): Promise<LiveAqiSummary> {
  const cacheKey = parseCity(location);
  const cached = requestCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const value = await fetchLiveAqi(location);
    requestCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + AQI_CACHE_TTL_MS
    });
    return value;
  } catch (error) {
    if (cached?.value) {
      console.warn("[AQI] Returning stale cached AQI after fetch failure for", location, error);
      return cached.value;
    }

    console.warn("[AQI] Using mock AQI fallback for", location, error);
    const fallback = getFallbackAqi(location);
    requestCache.set(cacheKey, {
      value: fallback,
      expiresAt: Date.now() + AQI_FALLBACK_TTL_MS
    });
    return fallback;
  }
}
