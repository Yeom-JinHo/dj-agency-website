import Link from "next/link";
import { SITE_SLUGS } from "@repo/content/schema";

import { SITE_LABELS } from "@/lib/sites";

// 사이트-우선 라우트(§8): 대시보드는 4개 사이트 카드 → /[site].
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          관리할 사이트를 선택하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SITE_SLUGS.map((site) => (
          <Link
            key={site}
            href={`/${site}`}
            className="hover:bg-muted/50 rounded-lg border p-5 transition-colors"
          >
            <h2 className="text-base font-medium">{SITE_LABELS[site]}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{site}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
