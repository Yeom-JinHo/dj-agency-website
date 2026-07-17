import type { IconName } from "@repo/ui/common/Icon";
import type { StaticImageData } from "next/image";

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
  /** 정적 import된 커버 이미지 — placeholder="blur"용 blurDataURL 자동 생성 */
  cover: StaticImageData;
  /** 모달 한 줄 설명 */
  shortDescription?: string;
  /** 스트리밍 플랫폼 버튼 소스 */
  links: TrackLink[];
}
