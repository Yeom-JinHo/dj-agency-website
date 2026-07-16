import { z } from "zod";

/** 저장값은 scheduled/soldout/cancelled. `past`는 event_date로 유도(저장하지 않음). */
export const TOUR_STATUSES = ["scheduled", "soldout", "cancelled"] as const;
export const tourStatusSchema = z.enum(TOUR_STATUSES);
export type TourStatus = z.infer<typeof tourStatusSchema>;

/** 신규 엔티티. event_date는 timestamptz(ISO 문자열). */
export const tourSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  artistId: z.string().uuid().nullable(),
  venue: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  eventDate: z.string(),
  doorTime: z.string().nullable(),
  ticketUrl: z.string().nullable(),
  posterPath: z.string().nullable(),
  posterPlaceholder: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  descriptionKo: z.string().nullable(),
  status: tourStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Tour = z.infer<typeof tourSchema>;
