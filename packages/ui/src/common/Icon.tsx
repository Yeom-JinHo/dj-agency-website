import type { FC } from "react";
import { IconType } from "react-icons";
import { LuPlus, LuMenu, LuX, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import {
  SiApple,
  SiApplemusic,
  SiBeatport,
  SiInstagram,
  SiSoundcloud,
  SiSpotify,
  SiX,
  SiYoutube,
  SiYoutubemusic,
} from "react-icons/si";

export type IconName =
  | "SiApple"
  | "SiApplemusic"
  | "SiBeatport"
  | "SiInstagram"
  | "SiSoundcloud"
  | "SiSpotify"
  | "SiX"
  | "SiYoutube"
  | "SiYoutubemusic"
  | "LuPlus"
  | "LuMenu"
  | "LuClose"
  | "LuArrowLeft"
  | "LuArrowRight";

const iconMap: Record<IconName, IconType> = {
  SiApple: SiApple,
  SiApplemusic: SiApplemusic,
  SiBeatport: SiBeatport,
  SiInstagram: SiInstagram,
  SiSoundcloud: SiSoundcloud,
  SiSpotify: SiSpotify,
  SiX: SiX,
  SiYoutube: SiYoutube,
  SiYoutubemusic: SiYoutubemusic,
  LuPlus: LuPlus,
  LuMenu: LuMenu,
  LuClose: LuX,
  LuArrowLeft: LuArrowLeft,
  LuArrowRight: LuArrowRight,
};

interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
}

export const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...rest
}) => {
  const Component = iconMap[name];
  return (
    <Component size={size} color={color} className={className} {...rest} />
  );
};
