import { weatherForecasts } from "@/data/mock";
import { districtProfiles } from "@/data/mock";
import { getAqiSummary } from "@/services/aqiService";
import type { WeatherForecast } from "@/types/environment";
import type { WeatherSummary } from "@/types/dashboard";
import type { ServiceResult } from "@/types/service";

type LiveWeatherPayload = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  hourly?: {
    time?: string[];
    relative_humidity_2m?: number[];
    precipitation?: number[];
    precipitation_probability?: number[];
  };
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const WEATHER_CACHE_TTL_MS = 1000 * 60 * 60 * 3;
const weatherSummaryCache = new Map<string, CacheEntry<WeatherSummary>>();
const forecastCache = new Map<string, CacheEntry<ServiceResult<WeatherForecast[]>>>();

const districtCoordinates: Record<string, { latitude: number; longitude: number; region: "Bihar" | "Jharkhand" }> = {
  Patna: { latitude: 25.5941, longitude: 85.1376, region: "Bihar" },
  Bhagalpur: { latitude: 25.2425, longitude: 86.9842, region: "Bihar" },
  Munger: { latitude: 25.3748, longitude: 86.4735, region: "Bihar" },
  Hajipur: { latitude: 25.6925, longitude: 85.2083, region: "Bihar" },
  Sahibganj: { latitude: 25.2445, longitude: 87.6341, region: "Jharkhand" },
  Dumka: { latitude: 24.2678, longitude: 87.2486, region: "Jharkhand" }
};

function formatUpdatedAt(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  }).format(date).replace(",", " •");
}

function normalizeWeatherCondition(code: number | undefined) {
  const mapping: Record<number, string> = {
    0: "Clear",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Showers",
    95: "Thunderstorm"
  };

  return mapping[code ?? -1] ?? "Variable Weather";
}

function sum(values: Array<number | undefined>, count: number) {
  return Math.round(values.slice(0, count).reduce<number>((total, value) => total + (value ?? 0), 0));
}

function average(values: Array<number | undefined>, count: number) {
  const slice = values.slice(0, count).filter((value): value is number => typeof value === "number");
  if (!slice.length) return null;
  return Math.round(slice.reduce((total, value) => total + value, 0) / slice.length);
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 3 }
  });

  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchDistrictWeather(district: string): Promise<WeatherForecast> {
  const coordinates = districtCoordinates[district] ?? districtCoordinates.Patna;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}` +
    "&current=temperature_2m,weather_code" +
    "&hourly=relative_humidity_2m,precipitation,precipitation_probability,weather_code,temperature_2m" +
    "&forecast_days=3&timezone=Asia%2FKolkata";

  const payload = await fetchJson<LiveWeatherPayload>(url);
  if (!payload.current || !payload.hourly) {
    console.warn("[Weather] Open-Meteo parse mismatch for district:", district, payload);
    throw new Error("Incomplete Open-Meteo payload.");
  }
  const hourlyRain = payload.hourly?.precipitation ?? [];
  const humiditySeries = payload.hourly?.relative_humidity_2m ?? [];

  return {
    district,
    region: coordinates.region,
    condition: normalizeWeatherCondition(payload.current?.weather_code),
    temperatureC: Math.round(payload.current?.temperature_2m ?? weatherForecasts[0].temperatureC),
    humidity: average(humiditySeries, 6) ?? weatherForecasts[0].humidity,
    rainfallMmNext24h: sum(hourlyRain, 24),
    rainfallMmNext48h: sum(hourlyRain, 48),
    updatedAt: formatUpdatedAt()
  };
}

function getForecastFallback(district: string): WeatherForecast {
  return weatherForecasts.find((item) => item.district === district) ?? weatherForecasts[0];
}

export async function getWeatherSummary(location = "Patna, Bihar"): Promise<WeatherSummary> {
  const cacheKey = location.toLowerCase();
  const cached = weatherSummaryCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const districtName = location.split(",")[0]?.trim() || "Patna";

  try {
    const [weatherResult, aqiResult] = await Promise.allSettled([
      fetchDistrictWeather(districtName),
      getAqiSummary(location)
    ]);

    const weather =
      weatherResult.status === "fulfilled"
        ? weatherResult.value
        : getForecastFallback(districtName);
    const aqi =
      aqiResult.status === "fulfilled"
        ? aqiResult.value
        : await getAqiSummary(location);

    const value: WeatherSummary = {
      temperatureC: weather.temperatureC,
      condition: weather.condition,
      aqi: aqi.aqi,
      aqiLabel: aqi.label,
      aqiColor: aqi.color,
      pm25: aqi.pm25,
      pm10: aqi.pm10,
      updatedAt: aqi.updatedAt,
      trend: aqi.trend
    };

    weatherSummaryCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS
    });

    return value;
  } catch (error) {
    if (cached?.value) {
      console.warn("[Weather] Returning stale cached weather summary for", location, error);
      return cached.value;
    }

    console.warn("[Weather] Falling back to safe weather summary for", location, error);
    const fallbackWeather = getForecastFallback(districtName);
    const fallbackAqi = await getAqiSummary(location);
    const value: WeatherSummary = {
      temperatureC: fallbackWeather.temperatureC,
      condition: fallbackWeather.condition,
      aqi: fallbackAqi.aqi,
      aqiLabel: fallbackAqi.label,
      aqiColor: fallbackAqi.color,
      pm25: fallbackAqi.pm25,
      pm10: fallbackAqi.pm10,
      updatedAt: fallbackAqi.updatedAt,
      trend: fallbackAqi.trend
    };

    weatherSummaryCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS
    });

    return value;
  }
}

export async function getWeatherForecasts(): Promise<ServiceResult<WeatherForecast[]>> {
  const cacheKey = "all-districts";
  const cached = forecastCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const data = await Promise.all(weatherForecasts.map((item) => fetchDistrictWeather(item.district)));
    const value: ServiceResult<WeatherForecast[]> = {
      data,
      lastUpdated: formatUpdatedAt(),
      source: "api"
    };

    forecastCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS
    });

    return value;
  } catch (error) {
    if (cached?.value) {
      console.warn("[Weather] Returning stale cached forecast collection after live fetch failure.", error);
      return cached.value;
    }

    console.warn("[Weather] Falling back to mock forecast collection.", error);
    const value: ServiceResult<WeatherForecast[]> = {
      data: weatherForecasts,
      lastUpdated: weatherForecasts[0].updatedAt,
      source: "mock"
    };

    forecastCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + WEATHER_CACHE_TTL_MS
    });

    return value;
  }
}

export async function getDistrictWeatherForecast(district: string) {
  try {
    const data = await fetchDistrictWeather(district);
    return {
      data,
      lastUpdated: data.updatedAt,
      source: "api"
    } satisfies ServiceResult<WeatherForecast>;
  } catch (error) {
    console.warn("[Weather] Falling back to mock district forecast for", district, error);
    const data = getForecastFallback(district);
    return {
      data,
      lastUpdated: data.updatedAt,
      source: "mock"
    } satisfies ServiceResult<WeatherForecast>;
  }
}

export async function getSupportedDistricts() {
  return districtProfiles;
}
