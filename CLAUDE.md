# v.f.labs

Turborepo monorepo with five Next.js apps (four public sites + an `admin` CMS) and shared packages. pnpm workspaces, Node ≥20.9 (`.nvmrc`), Next.js 16, React 19, TypeScript 5.9 — exact versions live in the `pnpm-workspace.yaml` catalog.

## Commands

Run from repo root via Turbo; `pnpm <task>` fans out to all workspaces.

- `pnpm dev` — run all apps in dev (persistent, not cached)
- `pnpm build` — build all apps/packages
- `pnpm lint` — eslint across workspaces (`--max-warnings 0`)
- `pnpm check-types` — `next typegen && tsc --noEmit` per app
- `pnpm format` — prettier on `**/*.{ts,tsx,md}`

Scope to one workspace with `--filter`, e.g. `pnpm build --filter=vague-frequency-labs`.

No test framework yet — verify with `lint` + `check-types`.

## Layout

```
apps/
  vague-frequency-labs/  Next.js app, port 3004 (main brand site)
  payday-records/        Next.js app, port 3002
  celebrate-agency/      Next.js app, port 3003
  juntaro/               Next.js app, port 3005 (juntaro artist site)
  admin/                 Next.js app, port 3006 (content CMS for the four sites, Supabase-backed)
packages/
  ui/                    @repo/ui — shared React components (exports: see packages/ui/package.json)
  content/               @repo/content — Supabase schema/clients, content queries, publish + revalidate, image→webp (exports: see packages/content/package.json)
  next-config/           @repo/next-config — shared Next.js base config (createNextConfig)
  utils/                 shared utilities
  types/                 shared TS types
  eslint-config/         @repo/eslint-config
  typescript-config/     @repo/typescript-config
```

Each app consumes `@repo/ui` via `workspace:*`. App `src/` typically contains `app/` (App Router), `components/`, `styles/`, `types/`, `utils/`; `vague-frequency-labs` also has `hooks/`, `consts/`.

## Stack conventions

- **Next.js 16** App Router + React 19. Dev ports are fixed per app (see `package.json`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `tailwind-merge`, `tailwindcss-animate`, `class-variance-authority`.
- **Animation/icons**: `motion`, `@tabler/icons-react`.
- **Catalog versions** pinned in `pnpm-workspace.yaml` — add shared deps there rather than per-app to keep versions in sync. The catalog is the source of truth for version numbers cited in this doc.
- **Turbo**: `build` depends on `^build`, caches `.next/**` (excl. cache); `dev` is `cache: false, persistent: true`.

## Content (CMS)

- Site content (artists, releases, tours, …) lives in Supabase. `apps/admin` edits it; the four sites read it through `@repo/content` queries. Hardcoded content sources were removed — do not reintroduce them.
- Entities belong to one site (no shared cross-site content model).
- Publishing: admin calls each site's `/api/revalidate` (`packages/content/src/revalidate`) with `REVALIDATE_SECRET`; sites use `revalidateTag` with `{ expire: 0 }`.
- admin auth: every route is guarded by `apps/admin/src/proxy.ts` (`@supabase/ssr` session refresh) with `/login` as the entry.

## Environment

See `.env.example`. All `.env*` files are gitignored.

- **Cross-site URLs** (root `.env`): `NEXT_PUBLIC_VAGUE_FREQUENCY_LABS_URL`, `NEXT_PUBLIC_PAYDAY_RECORDS_URL`, `NEXT_PUBLIC_CELEBRATE_AGENCY_URL` — used for inter-app links and as admin's publish targets. Consumed by `packages/utils/src/app-urls.ts`; falls back to `http://localhost:{port}` when unset. `NEXT_PUBLIC_JUNTARO_URL` is also read there (`getAppUrls().juntaro`) — juntaro uses it for its own `metadataBase` and admin as a publish target, not as a cross-site link target.
- **Supabase / CMS** (root `.env`, all five apps): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `REVALIDATE_SECRET` (shared secret for each site's `/api/revalidate`). `apps/admin/.env.example` additionally needs `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` (Vercel Cron → `/api/keepalive`).
- **VFL Maps** (`apps/vague-frequency-labs/.env.example`): `NEXT_PUBLIC_NAVER_CLIENT_ID` (NCP Maps, used by the contact page `KoreaCinematic`). Falls back to a Naver Map search link when the key is unset, the script fails to load, or it times out after 5s. Register deploy domains in the NCP console's domain allowlist.

## Assets

- **Images**: webp only, ≤1MB per file.
- Every image added to the repo (`.png`, `.jpg`, `.jpeg`, `.gif`, `.avif`, etc.) must be converted to webp immediately and the original deleted.
- Convert with `sharp`. Start at quality 80 and step the quality down until the file is ≤1MB.
- Update image reference paths in code/markdown/config to `.webp` accordingly.
- **Exception**: Next.js metadata convention files (`icon.*`, `apple-icon.*`, `favicon.*`, `opengraph-image.*`, `twitter-image.*`) and SVGs are left as-is — Next.js recognizes metadata files by fixed extensions, and SVGs are vectors, not conversion targets.

## Git

- Default branch: `master` (production, deployed).
- Feature/fix branches MUST branch from a freshly fetched `origin/master` (`git fetch origin master`), never from a stale local `master`. Same for new worktrees.
- PRs MUST target `master`.
- Before any `git push` (including `-u`, `--force`, `--force-with-lease`), run `git rev-parse --abbrev-ref HEAD` and show the user the current branch + remote target; proceed only after explicit confirmation. Never push directly to `master`.
- Any work that will end in a PR, or that rewrites history (rebase, cherry-pick, multi-commit refactors), or runs parallel agents, MUST happen in an isolated git worktree (`Agent({ isolation: "worktree" })` or `git worktree add`).
  - Exception: a quick edit or a single commit on the current branch that will not itself become a PR.
  - Worktrees live inside the repo at `.worktrees/<slug>`. Remove the worktree after the PR is merged.
