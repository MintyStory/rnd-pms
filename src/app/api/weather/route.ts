import { NextRequest, NextResponse } from "next/server";
import { latLonToGrid } from "@/lib/grid-convert";
import { getBaseDateTime } from "@/lib/weather-base-time";

const SKY_LABEL: Record<string, string> = { "1": "맑음", "3": "구름많음", "4": "흐림" };
const PTY_LABEL: Record<string, string> = {
  "0": "없음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "4": "소나기",
};

interface RawItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "37.5665");
  const lon = parseFloat(searchParams.get("lon") ?? "126.9780");

  const key = process.env.WEATHER_SERVICE_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "WEATHER_SERVICE_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { nx, ny } = latLonToGrid(lat, lon);
  const { base_date, base_time } = getBaseDateTime();

  const url = new URL(
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
  );
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("numOfRows", "1000");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", base_date);
  url.searchParams.set("base_time", base_time);
  url.searchParams.set("nx", String(nx));
  url.searchParams.set("ny", String(ny));

  let data: {
    response?: {
      header?: { resultCode?: string; resultMsg?: string };
      body?: { items?: { item?: RawItem[] } };
    };
  };
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "기상청 API 호출에 실패했습니다." }, { status: 502 });
  }

  if (data.response?.header?.resultCode !== "00") {
    return NextResponse.json(
      { error: data.response?.header?.resultMsg ?? "기상청 API 오류" },
      { status: 502 }
    );
  }

  const items = data.response?.body?.items?.item ?? [];
  const grouped = new Map<string, { date: string; time: string } & Record<string, string>>();
  for (const it of items) {
    const groupKey = `${it.fcstDate}${it.fcstTime}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, { date: it.fcstDate, time: it.fcstTime });
    }
    grouped.get(groupKey)![it.category] = it.fcstValue;
  }

  const forecasts = [...grouped.values()]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8)
    .map((f) => ({
      date: f.date,
      time: f.time,
      temp: f.TMP,
      rainProb: f.POP,
      humidity: f.REH,
      wind: f.WSD,
      sky: SKY_LABEL[f.SKY] ?? f.SKY ?? null,
      pty: PTY_LABEL[f.PTY] ?? f.PTY ?? null,
    }));

  return NextResponse.json({ nx, ny, base_date, base_time, forecasts });
}
