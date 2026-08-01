import { z } from "zod";
import { tourStatusSchema, type TourStatus } from "@repo/content/schema";

import { nullify } from "@/lib/form-normalize";

/**
 * Tour 편집 폼 값. content의 원자 스키마(tourStatusSchema)를 재사용해 검증을
 * 사이트 렌더와 공유한다. DB Row(tourSchema)와 달리 폼은 문자열 기반("" 대신
 * nullable)이고 id/timestamps/poster/slug/siteSlug를 제외한다 — slug는 title에서
 * 서버가 생성(§13 불변), siteSlug는 라우트에서 자동 부여, poster는 File로 별도
 * 전송(§4.4). event_date는 datetime-local 문자열로 다루고, ISO 변환은
 * 클라이언트에서(브라우저 TZ 기준). 이 스키마 하나를 client RHF resolver와
 * server 재검증이 공유한다.
 */
export const tourFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // 로스터 아티스트 선택(nullable). "" = 미지정.
  artistId: z.string(),
  venue: z.string(),
  city: z.string(),
  country: z.string(),
  // datetime-local 또는 ISO(제출 직전 클라이언트가 ISO로 변환) — 둘 다 비어있지 않은 문자열.
  eventDate: z.string().trim().min(1, "Event date is required"),
  doorTime: z.string(),
  ticketUrl: z.string(),
  descriptionEn: z.string(),
  descriptionKo: z.string(),
  status: tourStatusSchema,
  // 소속 모델: 사이트 내 노출 순서(tours.sort_order 단일 컬럼). 조인 테이블 폐기.
  sortOrder: z.number().int().min(0),
});

export type TourFormValues = z.infer<typeof tourFormSchema>;

/** 생성 폼 초기값. status는 기본 scheduled, 정렬은 0. */
export const emptyTourFormValues: TourFormValues = {
  title: "",
  artistId: "",
  venue: "",
  city: "",
  country: "",
  eventDate: "",
  doorTime: "",
  ticketUrl: "",
  descriptionEn: "",
  descriptionKo: "",
  status: "scheduled",
  sortOrder: 0,
};

/** 검증된 폼 값에서 파생되는 tours DB 컬럼(site_slug/slug/poster 제외 — 액션에서 처리). */
export interface TourDbColumns {
  title: string;
  artist_id: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  event_date: string;
  door_time: string | null;
  ticket_url: string | null;
  description_en: string | null;
  description_ko: string | null;
  status: TourStatus;
  sort_order: number;
}

/**
 * 검증된 폼 값 → DB 컬럼(poster/slug/site_slug 제외 — 액션에서 처리).
 * event_date는 클라이언트가 이미 ISO로 변환해 보낸 값을 그대로 신뢰한다
 * (서버에서 new Date()로 재해석하면 서버 TZ가 끼어들어 벽시계 시각이 어긋난다).
 */
export function formValuesToDbColumns(values: TourFormValues): TourDbColumns {
  return {
    title: values.title.trim(),
    artist_id: nullify(values.artistId),
    venue: nullify(values.venue),
    city: nullify(values.city),
    country: nullify(values.country),
    event_date: values.eventDate.trim(),
    door_time: nullify(values.doorTime),
    ticket_url: nullify(values.ticketUrl),
    description_en: nullify(values.descriptionEn),
    description_ko: nullify(values.descriptionKo),
    status: values.status,
    sort_order: values.sortOrder,
  };
}
