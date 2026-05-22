export function getAqiTone(aqi: number | null) {
  if (aqi === null || Number.isNaN(aqi)) return { label: "Unavailable", color: "#7c8d87" };
  if (aqi <= 50) return { label: "Good", color: "#2a8f62" };
  if (aqi <= 100) return { label: "Moderate", color: "#d9bb46" };
  if (aqi <= 150) return { label: "Poor", color: "#d88a32" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#cc4b4b" };
  return { label: "Severe", color: "#7d3940" };
}
