import type { FC } from "react";
import { IconType } from "react-icons";
import {
  LuPlus,
  LuMenu,
  LuX,
  LuArrowLeft,
  LuArrowRight,
  LuArrowUpRight,
} from "react-icons/lu";
import {
  SiApple,
  SiBeatport,
  SiInstagram,
  SiMixcloud,
  SiSoundcloud,
  SiSpotify,
  SiX,
  SiYoutube,
} from "react-icons/si";

export type IconName =
  | "SiApple"
  | "SiBeatport"
  | "SiInstagram"
  | "SiMixcloud"
  | "SiSoundcloud"
  | "SiSpotify"
  | "SiX"
  | "SiYoutube"
  | "LuPlus"
  | "LuMenu"
  | "LuClose"
  | "LuArrowLeft"
  | "LuArrowRight"
  | "LuArrowUpRight";

const iconMap: Record<IconName, IconType> = {
  SiApple: SiApple,
  SiBeatport: SiBeatport,
  SiInstagram: SiInstagram,
  SiMixcloud: SiMixcloud,
  SiSoundcloud: SiSoundcloud,
  SiSpotify: SiSpotify,
  SiX: SiX,
  SiYoutube: SiYoutube,
  LuPlus: LuPlus,
  LuMenu: LuMenu,
  LuClose: LuX,
  LuArrowLeft: LuArrowLeft,
  LuArrowRight: LuArrowRight,
  LuArrowUpRight: LuArrowUpRight,
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
