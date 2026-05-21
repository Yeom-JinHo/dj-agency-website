import { IconName } from "@repo/ui/common/Icon";

export type PlatformName =
  | "SoundCloud"
  | "YouTube"
  | "Instagram"
  | "Mixcloud";

export interface Platform {
  name: PlatformName;
  iconName: IconName;
  brandColor: string;
}

export interface Credit {
  artist: string;
  platform: PlatformName;
  date: string;
  url: string;
  note?: string;
}
