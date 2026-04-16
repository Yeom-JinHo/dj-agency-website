import type { AppId } from "./company";

const DEV_FALLBACK: Record<AppId, string> = {
  "vague-frequency-labs": "http://localhost:3004",
  "payday-records": "http://localhost:3002",
  "celebrate-agency": "http://localhost:3003",
};

export function getAppUrls(): Record<AppId, string> {
  return {
    "vague-frequency-labs":
      process.env.NEXT_PUBLIC_VFL_URL ?? DEV_FALLBACK["vague-frequency-labs"],
    "payday-records":
      process.env.NEXT_PUBLIC_PR_URL ?? DEV_FALLBACK["payday-records"],
    "celebrate-agency":
      process.env.NEXT_PUBLIC_CA_URL ?? DEV_FALLBACK["celebrate-agency"],
  };
}

export type { AppId };
