import type { IconName } from "@repo/ui/common/Icon";

export interface TrackLink {
  platform: string;
  href: string;
  iconName: IconName;
}

export interface JuntaroTrack {
  id: string;
  name: string;
  /** 기본 "Juntaro" */
  artist?: string;
  /** 커버 이미지 URL(Storage 공개 URL) */
  cover: string;
  /** blurDataURL(placeholder). CMS가 업로드 시 생성 — 없으면 blur 생략. */
  coverPlaceholder?: string;
  /** 모달 한 줄 설명 */
  shortDescription?: string;
  /** 스트리밍 플랫폼 버튼 소스 */
  links: TrackLink[];
}
