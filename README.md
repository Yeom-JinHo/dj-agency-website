<div align="center">

# dj-agency-website

Turborepo monorepo — three Next.js 15 sites + shared packages.

![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-000?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-000?style=flat-square&logo=typescript)
![Turborepo](https://img.shields.io/badge/Turborepo-000?style=flat-square&logo=turborepo)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-000?style=flat-square&logo=tailwindcss)

**Live** &nbsp;·&nbsp; [Vague Frequency Labs](https://vague-frequency-labs.vercel.app/?utm_source=github&utm_content=repo_readme) &nbsp;·&nbsp; [Payday Records](https://payday-records.vercel.app/?utm_source=github&utm_content=repo_readme) &nbsp;·&nbsp; [Celebrate Agency](https://celebrate-agency.vercel.app/?utm_source=github&utm_content=repo_readme)

</div>

---

## [Vague Frequency Laboratory](https://vague-frequency-labs.vercel.app/?utm_source=github&utm_content=repo_readme)

<a href="https://vague-frequency-labs.vercel.app/?utm_source=github&utm_content=repo_readme">
  <img src="docs/previews/vague-frequency-labs.webp" alt="Vague Frequency Laboratory homepage" />
</a>

<details>
<summary><strong>Sections</strong> — About · Artist Profiles · Music</summary>

![VFL — About](docs/previews/vfl-about.webp)
![VFL — Artist Profiles](docs/previews/vfl-artist-profiles.webp)
![VFL — Music](docs/previews/vfl-music-list.webp)

</details>

## [Payday Records](https://payday-records.vercel.app/?utm_source=github&utm_content=repo_readme)

<a href="https://payday-records.vercel.app/?utm_source=github&utm_content=repo_readme">
  <img src="docs/previews/payday-records.webp" alt="Payday Records homepage" />
</a>

<details>
<summary><strong>Sections</strong> — About · Release · Sound · Contact</summary>

![Payday — About](docs/previews/payday-about.webp)
![Payday — Release](docs/previews/payday-release.webp)
![Payday — Sound](docs/previews/payday-sound.webp)
![Payday — Contact](docs/previews/payday-contact.webp)

</details>

## [Celebrate Agency](https://celebrate-agency.vercel.app/?utm_source=github&utm_content=repo_readme)

<a href="https://celebrate-agency.vercel.app/?utm_source=github&utm_content=repo_readme">
  <img src="docs/previews/celebrate-agency.webp" alt="Celebrate Agency homepage" />
</a>

<details>
<summary><strong>Sections</strong> — Roster · Work · Contact</summary>

![Celebrate — Roster](docs/previews/celebrate-roster.webp)
![Celebrate — Work](docs/previews/celebrate-work.webp)
![Celebrate — Contact](docs/previews/celebrate-contact.webp)

</details>

---

## Dev

```sh
pnpm install
pnpm dev                                 # all apps (3002 / 3003 / 3004)
pnpm dev --filter=vague-frequency-labs   # one app
pnpm build | pnpm lint | pnpm check-types
```

No test framework — verify with `lint` + `check-types`. See [`CLAUDE.md`](CLAUDE.md) for structure, env, and conventions.
