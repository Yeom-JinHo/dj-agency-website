# v.f.labs

Turborepo monorepo — three Next.js 15 sites + shared packages.

## Sites

### [Vague Frequency Laboratory ↗](https://vague-frequency-labs.vercel.app/?utm_source=github&utm_content=repo_readme) · `:3004`

[![Vague Frequency Laboratory homepage](docs/previews/vague-frequency-labs.webp)](https://vague-frequency-labs.vercel.app/?utm_source=github&utm_content=repo_readme)

<details>
<summary><strong>Sections</strong> — About · Artist Profiles · Music</summary>

![VFL — About](docs/previews/vfl-about.webp)
![VFL — Artist Profiles](docs/previews/vfl-artist-profiles.webp)
![VFL — Music](docs/previews/vfl-music-list.webp)

</details>

### [Payday Records ↗](https://payday-records.vercel.app/?utm_source=github&utm_content=repo_readme) · `:3002`

[![Payday Records homepage](docs/previews/payday-records.webp)](https://payday-records.vercel.app/?utm_source=github&utm_content=repo_readme)

<details>
<summary><strong>Sections</strong> — About · Release · Sound · Contact</summary>

![Payday — About](docs/previews/payday-about.webp)
![Payday — Release](docs/previews/payday-release.webp)
![Payday — Sound](docs/previews/payday-sound.webp)
![Payday — Contact](docs/previews/payday-contact.webp)

</details>

### [Celebrate Agency ↗](https://celebrate-agency.vercel.app/?utm_source=github&utm_content=repo_readme) · `:3003`

[![Celebrate Agency homepage](docs/previews/celebrate-agency.webp)](https://celebrate-agency.vercel.app/?utm_source=github&utm_content=repo_readme)

<details>
<summary><strong>Sections</strong> — Roster · Work · Contact</summary>

![Celebrate — Roster](docs/previews/celebrate-roster.webp)
![Celebrate — Work](docs/previews/celebrate-work.webp)
![Celebrate — Contact](docs/previews/celebrate-contact.webp)

</details>

## Dev

```sh
pnpm install
pnpm dev                                 # all apps (3002 / 3003 / 3004)
pnpm dev --filter=vague-frequency-labs   # one app
pnpm build | pnpm lint | pnpm check-types
```

No test framework — verify with `lint` + `check-types`. See [`CLAUDE.md`](CLAUDE.md) for structure, env, and conventions.
