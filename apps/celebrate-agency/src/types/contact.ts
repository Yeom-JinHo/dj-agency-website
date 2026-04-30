import { IconName } from "@repo/ui/common/Icon";

export interface Socials {
  name: string;
  href: string;
  iconName?: IconName;
}

export interface Contact {
  email: string;
  socials: Socials[];
}
