import { Disc3, MapPin, Users, type LucideIcon } from "lucide-react";

import type { CategorySegment } from "@/lib/sites";

/**
 * 카테고리 세그먼트 → 아이콘. 사이트 홈 카드([site]/page.tsx)·사이드바 nav가
 * 공유한다 — lib/sites는 lucide 무의존 순수 데이터로 유지하기 위해 이 모듈로
 * 분리했다.
 */
export const CATEGORY_ICONS: Record<CategorySegment, LucideIcon> = {
  artists: Users,
  releases: Disc3,
  tours: MapPin,
};
