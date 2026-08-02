/**
 * 목록 셀의 날짜 표시(Artist/Release/Tour 공용). Asia/Seoul로 타임존을 고정해
 * 서버 실행 환경 TZ와 무관하게 KST 날짜를 보여준다(단일 KST 편집자 기준) —
 * toLocaleDateString은 서버 TZ에 의존해 하루가 밀릴 수 있어 배제. 부분 조합이라
 * 로케일 비종속이다.
 */
function seoulParts(
  value: string,
  options: Intl.DateTimeFormatOptions,
): (type: string) => string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  }).formatToParts(new Date(value));
  return (type) => parts.find((p) => p.type === type)?.value ?? "";
}

/** `2026-10-03` */
export function formatDate(value: string): string {
  const get = seoulParts(value, {});
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** `2026-10-03 21:00` — 시각까지 보여주는 tour event_date(timestamptz)용. */
export function formatDateTime(value: string): string {
  const get = seoulParts(value, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}
