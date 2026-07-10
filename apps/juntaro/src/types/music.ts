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
  /** 모노 메타 (선택) */
  label?: string;
  /** placeholder webp 경로 */
  cover: string;
  /** 모달 한 줄 설명 */
  shortDescription?: string;
  /** 스트리밍 플랫폼 버튼 소스 */
  links: TrackLink[];
}
