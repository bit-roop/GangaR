"use client";

import Link from "next/link";

import { RoleSimulationSelect } from "@/components/incidents/RoleSimulationSelect";
import { routes } from "@/config/routes";
import type { WeatherSummary } from "@/types/dashboard";

type TopbarProps = {
  location: string;
  greeting: string;
  subcopy: string;
  weather: WeatherSummary;
};

export function Topbar({ location, greeting, subcopy, weather }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{location}</p>
        <h2>{greeting}</h2>
        <p className="subcopy">{subcopy}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-status">
          <div className="weather-chip">
            <span className="weather-icon">⛅</span>
            <div>
              <strong>{weather.temperatureC}°C</strong>
              <p>{weather.condition}</p>
            </div>
          </div>
          <div className="aqi-chip">
            <span>{weather.aqi !== null ? `AQI ${weather.aqi}` : "AQI --"}</span>
            <strong>{weather.aqiLabel}</strong>
            <p>{weather.updatedAt}{weather.trend ? ` • ${weather.trend}` : ""}</p>
          </div>
        </div>
        <div className="topbar-identity">
          <RoleSimulationSelect compact />
          <Link href={routes.settings} className="avatar" aria-label="Open settings">
            A
          </Link>
        </div>
      </div>
    </header>
  );
}
