// P1은 골격만 — Artist/Music/Tour CRUD는 P2에서 shadcn table/form으로 구축한다.
const SECTIONS = [
  { title: "Artists", description: "Shared roster across all sites." },
  { title: "Music", description: "Releases and tracks." },
  { title: "Tours", description: "Scheduled events." },
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
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border p-5"
            aria-label={section.title}
          >
            <h2 className="text-base font-medium">{section.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {section.description}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
