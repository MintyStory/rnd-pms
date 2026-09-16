// 단기예보 발표시각(0200,0500,0800,1100,1400,1700,2000,2300) 중
// 현재 시각(KST) 기준으로 조회 가능한 가장 최근 발표시각을 계산한다.
// (API는 각 발표시각 + 10분 이후부터 제공)

const BASE_TIMES = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"];

export function getBaseDateTime(now: Date = new Date()): { base_date: string; base_time: string } {
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const nowMinutes = kst.getHours() * 60 + kst.getMinutes();

  let chosen: string | null = null;
  for (let i = BASE_TIMES.length - 1; i >= 0; i--) {
    const bt = BASE_TIMES[i];
    const btMinutes = parseInt(bt.slice(0, 2), 10) * 60 + parseInt(bt.slice(2), 10);
    if (nowMinutes >= btMinutes + 10) {
      chosen = bt;
      break;
    }
  }

  const date = new Date(kst);
  if (!chosen) {
    chosen = "2300";
    date.setDate(date.getDate() - 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { base_date: `${y}${m}${d}`, base_time: chosen };
}
