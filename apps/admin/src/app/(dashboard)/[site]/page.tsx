import Link from "next/link";
import { notFound } from "next/navigation";

import { CATEGORIES, isSiteSlug, SITE_LABELS } from "@/lib/sites";

// 사이트 홈(§8): 카테고리 3카드 → /[site]/artists 등.
export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {SITE_LABELS[site]}
        </h1>
        <p className="text-muted-foreground text-sm">
          관리할 카테고리를 선택하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.segment}
            href={`/${site}/${category.segment}`}
            className="hover:bg-muted/50 rounded-lg border p-5 transition-colors"
          >
            <h2 className="text-base font-medium">{category.label}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
