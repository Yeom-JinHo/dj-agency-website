import type { AppId } from "./company";

const DEV_FALLBACK: Record<AppId, string> = {
  VFL: "http://localhost:3004",
  PR: "http://localhost:3002",
  CA: "http://localhost:3003",
};

export function getAppUrls(): Record<AppId, string> {
  return {
    VFL: process.env.NEXT_PUBLIC_VFL_URL ?? DEV_FALLBACK.VFL,
    PR: process.env.NEXT_PUBLIC_PR_URL ?? DEV_FALLBACK.PR,
    CA: process.env.NEXT_PUBLIC_CA_URL ?? DEV_FALLBACK.CA,
  };
}

export type { AppId };
