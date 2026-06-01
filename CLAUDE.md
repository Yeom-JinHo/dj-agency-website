# v.f.labs

Turborepo monorepo with three Next.js 15 apps and shared packages. pnpm workspaces, Node 18+, TypeScript 5.9, React 19.

## Commands

Run from repo root via Turbo; `pnpm <task>` fans out to all workspaces.

- `pnpm dev` — run all apps in dev (persistent, not cached)
- `pnpm build` — build all apps/packages
- `pnpm lint` — eslint across workspaces (`--max-warnings 0`)
- `pnpm check-types` — `next typegen && tsc --noEmit` per app
- `pnpm format` — prettier on `**/*.{ts,tsx,md}`

Scope to one workspace with `--filter`, e.g. `pnpm build --filter=vague-frequency-labs`.

## Layout

```
apps/
  vague-frequency-labs/  Next.js app, port 3004 (main brand site)
  payday-records/        Next.js app, port 3002
  celebrate-agency/      Next.js app, port 3003
packages/
  ui/                    @repo/ui — shared React components (exports ./fancy/link, ./common/*, ./*)
  next-config/           @repo/next-config — shared Next.js base config (createNextConfig)
  utils/                 shared utilities
  types/                 shared TS types
  eslint-config/         @repo/eslint-config
  typescript-config/     @repo/typescript-config
```

Each app consumes `@repo/ui` via `workspace:*`. App `src/` typically contains `app/` (App Router), `components/`, `styles/`, `types/`, `utils/`; `vague-frequency-labs` also has `hooks/`, `consts/`.

## Stack conventions

- **Next.js 15.5** App Router + React 19. Dev ports are fixed per app (see `package.json`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `tailwind-merge`, `tailwindcss-animate`, `class-variance-authority`.
- **Animation/icons**: `motion`, `@tabler/icons-react`.
- **Catalog versions** pinned in `pnpm-workspace.yaml` — add shared deps there rather than per-app to keep versions in sync.
- **Turbo**: `build` depends on `^build`, caches `.next/**` (excl. cache); `dev` is `cache: false, persistent: true`.

## Assets

- **Images**: webp only, ≤1MB per file.
- Every image added to the repo (`.png`, `.jpg`, `.jpeg`, `.gif`, `.avif`, etc.) must be converted to webp immediately and the original deleted.
- Convert with `sharp`. Start at quality 80 and step the quality down until the file is ≤1MB.
- Update image reference paths in code/markdown/config to `.webp` accordingly.
- **Exception**: Next.js metadata convention files (`icon.*`, `apple-icon.*`, `favicon.*`, `opengraph-image.*`, `twitter-image.*`) and SVGs are left as-is — Next.js recognizes metadata files by fixed extensions, and SVGs are vectors, not conversion targets.

## Git

- Default branch: `master` (production, deployed).
- Feature/fix branches MUST branch out from `master`.
- Always refresh `origin/master` before starting work and branch from it (`git fetch origin master`). Create new branches/worktrees from the updated `origin/master`, not a stale local `master`.
- PRs MUST target `master`.
- Before any `git push` (including `-u`, `--force`, `--force-with-lease`), run `git rev-parse --abbrev-ref HEAD` and show the user the current branch + remote target; proceed only after explicit confirmation. Never push directly to `master`.
- For multi-step git workflows (branch + commit + push + PR, rebase, cherry-pick, refactors spanning >1 commit, parallel agents), Claude MUST operate in an isolated git worktree (`Agent({ isolation: "worktree" })` or `git worktree add`). After the work is merged, remove the worktree. Single-file edits or single quick commits on the current branch don't require a worktree.
