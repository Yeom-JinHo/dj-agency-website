# v.f.labs

A Turborepo monorepo housing three independent Next.js sites for a Seoul-based electronic-music and creative collective — the flagship label brand, a sister label, and a talent agency — plus the shared packages they build on.

Built with **Next.js 15** (App Router) · **React 19** · **TypeScript 5.9** · **Tailwind CSS v4** · **pnpm workspaces** · **Turborepo**.

## Sites

### Vague Frequency Laboratory · `:3004`

Independent Seoul electronic-music label spotlighting experimental tech house and bass house. The site is the label's flagship identity surface — a poster, not a catalog: cream-on-black monotone, a single taegeuk accent, and a dotted world map tracing "Seoul to everywhere."

![Vague Frequency Laboratory homepage](docs/previews/vague-frequency-labs.webp)

### Payday Records · `:3002`

Independent electronic label across deep house, melodic techno, and the textures between. A single-page calling card that establishes a point of view and routes visitors straight into listening — release cards, platform links, and embeds.

![Payday Records homepage](docs/previews/payday-records.webp)

### Celebrate Agency · `:3003`

Seoul-based talent, production, and direction agency. A single-page site that proves the roster and the work without a pitch — dark editorial craft where the site itself signals the agency's.

![Celebrate Agency homepage](docs/previews/celebrate-agency.webp)

> Previews are desktop screenshots of each site's homepage running locally. Regenerate them after notable hero/landing changes.

## Getting started

Requires **Node 18+** and **pnpm**.

```sh
pnpm install     # install all workspaces
pnpm dev         # run all three apps in dev (3002 / 3003 / 3004)
```

Scope to a single app with a Turbo filter:

```sh
pnpm dev --filter=vague-frequency-labs
pnpm dev --filter=payday-records
pnpm dev --filter=celebrate-agency
```

## Tasks

Run from the repo root; Turbo fans each task out across workspaces.

| Command | Description |
| --- | --- |
| `pnpm dev` | Run all apps in dev (persistent, not cached) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | ESLint across workspaces (`--max-warnings 0`) |
| `pnpm check-types` | `next typegen && tsc --noEmit` per app |
| `pnpm format` | Prettier on `**/*.{ts,tsx,md}` |

> There is no test framework yet — verify changes with `pnpm lint` and `pnpm check-types`.

## Layout

```
apps/
  vague-frequency-labs/   Next.js app, port 3004 (main brand site)
  payday-records/         Next.js app, port 3002
  celebrate-agency/       Next.js app, port 3003
packages/
  ui/                     @repo/ui — shared React components
  next-config/            @repo/next-config — shared Next.js base config
  utils/                  shared utilities (incl. cross-site URL resolution)
  types/                  shared TS types
  eslint-config/          @repo/eslint-config
  typescript-config/      @repo/typescript-config
docs/
  previews/               site preview screenshots used in this README
```

Each app consumes `@repo/ui` via `workspace:*`. Shared dependency versions are pinned in `pnpm-workspace.yaml` (catalog) to keep them in sync across the monorepo.

## Conventions

- **Images**: webp only, ≤1MB per file (convert with `sharp`). Next.js metadata files (`opengraph-image.*`, `icon.*`, etc.) and SVGs are left as-is.
- **Environment**: cross-site URLs and the VFL Naver Maps key live in `.env*` (gitignored); see `CLAUDE.md` for the full list and fallbacks.
- **Git**: branch from an up-to-date `origin/master`; PRs target `master`.

See [`CLAUDE.md`](CLAUDE.md) for the full contributor reference.
