
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Loader2,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  Moon,
  LocateFixed,
  History,
  TriangleAlert,
} from "lucide-react";

// --- Utility helpers ---
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
};

const WMO = {
  0: { label: "Clear sky", Icon: Sun },
  1: { label: "Mainly clear", Icon: Sun },
  2: { label: "Partly cloudy", Icon: Cloud },
  3: { label: "Overcast", Icon: Cloud },
  45: { label: "Fog", Icon: Cloud },
  48: { label: "Depositing rime fog", Icon: Cloud },
  51: { label: "Light drizzle", Icon: Droplets },
  53: { label: "Drizzle", Icon: Droplets },
  55: { label: "Dense drizzle", Icon: Droplets },
  61: { label: "Slight rain", Icon: Droplets },
  63: { label: "Rain", Icon: Droplets },
  65: { label: "Heavy rain", Icon: Droplets },
  71: { label: "Snow fall", Icon: Cloud },
  73: { label: "Snow", Icon: Cloud },
  75: { label: "Heavy snow", Icon: Cloud },
  77: { label: "Snow grains", Icon: Cloud },
  80: { label: "Rain showers", Icon: Droplets },
  81: { label: "Rain showers", Icon: Droplets },
  82: { label: "Violent rain showers", Icon: Droplets },
  95: { label: "Thunderstorm", Icon: TriangleAlert },
  96: { label: "Thunderstorm + hail", Icon: TriangleAlert },
  99: { label: "Thunderstorm + hail", Icon: TriangleAlert },
};

function formatHour(ts, tz) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

function formatDay(ts, tz) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: tz,
  });
}

export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("c"); // c or f
  const [searching, setSearching] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState(null);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentCities") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("recentCities", JSON.stringify(recent.slice(0, 6)));
  }, [recent]);

  const performSearch = async (q) => {
    if (!q?.trim()) return;
    setSearching(true);
    setError("");
    try {
      const data = await fetchJSON(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=8&language=en&format=json`
      );
      const opts = (data?.results || []).map((r) => ({
        name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${
          r.country ? ", " + r.country : ""
        }`,
        lat: r.latitude,
        lon: r.longitude,
        tz: r.timezone,
      }));
      setOptions(opts);
    } catch {
      setError("Couldn't search locations. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const loadWeather = async (place) => {
    if (!place) return;
    setLoading(true);
    setError("");
    setWeather(null);
    setSelected(place);
    try {
      const tempUnit = unit === "f" ? "fahrenheit" : "celsius";
      const windUnit = unit === "f" ? "mph" : "kmh";
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.search = new URLSearchParams({
        latitude: place.lat,
        longitude: place.lon,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
        hourly: "temperature_2m,precipitation_probability,weather_code",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        timezone: "auto",
        temperature_unit: tempUnit,
        wind_speed_unit: windUnit,
      }).toString();

      const data = await fetchJSON(url.toString());
      setWeather(data);
      setRecent((prev) => {
        const without = prev.filter((x) => x.name !== place.name);
        return [place, ...without].slice(0, 6);
      });
    } catch {
      setError("Couldn't load weather. Please try another city.");
    } finally {
      setLoading(false);
    }
  };

  const onUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser.");
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const reverse = await fetchJSON(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`
          );
          const r = reverse?.results?.[0];
          const place = {
            name: r
              ? `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${
                  r.country ? ", " + r.country : ""
                }`
              : `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
            lat,
            lon,
            tz:
              r?.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          loadWeather(place);
        } catch {
          loadWeather({
            name: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
            lat,
            lon,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      },
      (err) => setError(err.message || "Failed to get location.")
    );
  };

  useEffect(() => {
    if (selected) loadWeather(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const CurrentIcon = useMemo(() => {
    const code = weather?.current?.weather_code;
    return WMO[code]?.Icon || Sun;
  }, [weather]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold"
          >
            Weather Now
          </motion.h1>
          <div className="flex items-center gap-2">
            <select
              className="bg-slate-800 px-3 py-2 rounded text-white border border-slate-700"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="c">Metric (°C, km/h)</option>
              <option value="f">Imperial (°F, mph)</option>
            </select>
            <button
              onClick={onUseMyLocation}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded"
            >
              <LocateFixed className="h-4 w-4" /> Use my location
            </button>
          </div>
        </header>

        {/* Search Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
              <input
                className="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded w-full"
                placeholder="e.g., Bhopal, London, New York"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performSearch(query)}
              />
            </div>
            <button
              onClick={() => performSearch(query)}
              disabled={searching}
              className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  onClick={() => loadWeather(opt)}
                >
                  <MapPin className="h-4 w-4" /> {opt.name}
                </button>
              ))}
            </div>
          )}

          {/* Recent */}
          {recent.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                <History className="h-4 w-4" /> Recent
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r, i) => (
                  <button
                    key={i}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
                    onClick={() => loadWeather(r)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-300 text-sm flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" /> {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        )}

        {/* Weather Display */}
        {!loading && weather && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {/* Current Weather */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xl mb-3">
                <MapPin className="h-5 w-5" /> {selected?.name}
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-800/60">
                  {weather.current.is_day ? (
                    <Sun className="h-10 w-10" />
                  ) : (
                    <Moon className="h-10 w-10" />
                  )}
                </div>
                <div>
                  <div className="text-4xl font-semibold flex items-baseline gap-2">
                    {Math.round(weather.current.temperature_2m)}°
                    <span className="text-base opacity-70">
                      {unit === "f" ? "F" : "C"}
                    </span>
                  </div>
                  <div className="opacity-80 text-sm flex items-center gap-2 mt-1">
                    <CurrentIcon className="h-4 w-4" />{" "}
                    {WMO[weather.current.weather_code]?.label || ""}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1 opacity-90">
                      <Thermometer className="h-4 w-4" /> Feels{" "}
                      {Math.round(weather.current.apparent_temperature)}°
                    </div>
                    <div className="flex items-center gap-1 opacity-90">
                      <Droplets className="h-4 w-4" />{" "}
                      {weather.current.relative_humidity_2m}%
                    </div>
                    <div className="flex items-center gap-1 opacity-90">
                      <Wind className="h-4 w-4" />{" "}
                      {Math.round(weather.current.wind_speed_10m)}{" "}
                      {unit === "f" ? "mph" : "km/h"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 lg:col-span-2">
              <div className="text-lg mb-3">Next 24 hours</div>
              <div className="overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-[minmax(90px,1fr)] gap-3">
                  {weather.hourly.time.slice(0, 24).map((t, i) => {
                    const code = weather.hourly.weather_code[i];
                    const Icon = WMO[code]?.Icon || Sun;
                    return (
                      <div
                        key={i}
                        className="rounded-2xl p-3 bg-slate-800/50 border border-slate-800 text-center"
                      >
                        <div className="text-xs opacity-70">
                          {formatHour(t, weather.timezone)}
                        </div>
                        <div className="flex items-center justify-center py-1">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-lg font-semibold">
                          {Math.round(weather.hourly.temperature_2m[i])}°
                        </div>
                        <div className="text-xs opacity-70">
                          {weather.hourly.precipitation_probability?.[i] ?? 0}%
                          rain
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Daily */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 lg:col-span-3">
              <div className="text-lg mb-3">7-day forecast</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {weather.daily.time.map((t, i) => {
                  const code = weather.daily.weather_code[i];
                  const Icon = WMO[code]?.Icon || Sun;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-4 bg-slate-800/50 border border-slate-800"
                    >
                      <div className="text-sm opacity-80 mb-1">
                        {formatDay(t, weather.timezone)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-6 w-6" />
                        <div className="text-sm opacity-90">
                          {WMO[code]?.label || ""}
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <div className="text-2xl font-semibold">
                          {Math.round(weather.daily.temperature_2m_max[i])}°
                        </div>
                        <div className="opacity-70">
                          /{Math.round(weather.daily.temperature_2m_min[i])}°
                        </div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        Rain: {Math.round(weather.daily.precipitation_sum[i] || 0)}{" "}
                        mm
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {!weather && !loading && (
          <div className="text-center opacity-80 py-12">
            Search for a city or use your location to see current conditions,
            hourly, and 7-day forecast. No API key required.
          </div>
        )}

        <footer className="mt-10 text-xs opacity-60 text-center">
          Data by Open-Meteo • Built with React, Tailwind, Framer Motion, Lucide
        </footer>
      </div>
    </div>
  );
}
