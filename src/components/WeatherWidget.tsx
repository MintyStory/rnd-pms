"use client";

import { useEffect, useState } from "react";

interface ForecastItem {
  date: string;
  time: string;
  temp?: string;
  rainProb?: string;
  humidity?: string;
  wind?: string;
  sky?: string | null;
  pty?: string | null;
}

function formatTime(time: string) {
  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}

export default function WeatherWidget() {
  const [forecasts, setForecasts] = useState<ForecastItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function load(lat: number, lon: number) {
      fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "날씨 조회 실패");
          setForecasts(data.forecasts);
        })
        .catch((e) => setError(e instanceof Error ? e.message : "날씨 조회 실패"));
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => load(37.5665, 126.978),
        { timeout: 5000 }
      );
    } else {
      load(37.5665, 126.978);
    }
  }, []);

  if (error) {
    return (
      <div className="rounded border border-gray-200 bg-white px-4 py-3 text-xs text-gray-400">
        날씨 정보를 불러오지 못했습니다 ({error})
      </div>
    );
  }

  if (!forecasts) {
    return (
      <div className="rounded border border-gray-200 bg-white px-4 py-3 text-xs text-gray-400">
        날씨 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto rounded border border-gray-200 bg-white px-4 py-3">
      <span className="shrink-0 text-xs font-medium text-gray-500">
        기상청 단기예보
      </span>
      {forecasts.slice(0, 6).map((f) => (
        <div key={f.date + f.time} className="flex shrink-0 flex-col items-center gap-0.5 text-xs">
          <span className="text-gray-400">{formatTime(f.time)}</span>
          <span className="font-medium text-gray-900">
            {f.temp != null ? `${f.temp}℃` : "-"}
          </span>
          <span className="text-gray-500">
            {f.pty && f.pty !== "없음" ? f.pty : f.sky ?? "-"}
          </span>
          <span className="text-gray-400">강수 {f.rainProb ?? "-"}%</span>
        </div>
      ))}
    </div>
  );
}
