import Link from "next/link";

// Artist는 P2에서 CRUD 연결 완료. Music/Tour는 P2 예정(자리 유지).
const SECTIONS = [
  {
    title: "Artists",
    description: "Shared roster across all sites.",
    href: "/artists",
  },
  { title: "Music", description: "Releases and tracks.", href: null },
  { title: "Tours", description: "Scheduled events.", href: null },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Content management for v.f.labs sites.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) =>
          section.href ? (
            <Link
              key={section.title}
              href={section.href}
              aria-label={section.title}
              className="hover:bg-muted/50 rounded-lg border p-5 transition-colors"
            >
              <h2 className="text-base font-medium">{section.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {section.description}
              </p>
            </Link>
          ) : (
            <section
              key={section.title}
              className="rounded-lg border p-5 opacity-60"
              aria-label={section.title}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium">{section.title}</h2>
                <span className="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-xs">
                  P2 예정
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {section.description}
              </p>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
