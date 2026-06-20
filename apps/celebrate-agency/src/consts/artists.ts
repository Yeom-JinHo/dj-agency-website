import type { Artist, ArtistSocial } from "@/types/artist";

export const ARTIST_ROLE_LABEL = "DJ · Producer";

const COMING_SOON_SOCIALS: ArtistSocial[] = [
  {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
  },
  { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
  { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
  { platform: "spotify", url: "https://open.spotify.com/" },
];

const comingSoon = (id: string, name: string, image: string): Artist => ({
  id,
  name,
  image,
  bio: "Coming Soon.",
  city: "Seoul",
  selectedWorks: [{ id: "—", title: "Coming Soon", meta: "—" }],
  socials: COMING_SOON_SOCIALS,
});

export const ARTISTS: Artist[] = [
  // — Numbered order (art/1.SAM … 24.PREED) —
  {
    id: "sam",
    name: "SAM",
    image: "/images/artist/sam/profile.webp",
    bio: "Korean DJ and producer crafting a distinctive electronic sound.",
    city: "Seoul",
    selectedWorks: [
      { id: "A01", title: "Producer Set 01", meta: "MIX · 2025" },
      { id: "A02", title: "Studio Sessions", meta: "RECORD · 2024" },
      {
        id: "A03",
        title: "Korean Electronic — Compilation",
        meta: "RECORD · 2024",
      },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "juntaro",
    name: "Juntaro",
    image: "/images/artist/juntaro/profile.webp",
    bio: "Tech House producer and DJ based in Seoul, presenting fresh trends with his own sound. Released on labels like Matroda's Terminal Underground Records and peaked at #6 on the Beatport Tech House charts.",
    city: "Seoul",
    selectedWorks: [
      {
        id: "A01",
        title: "Terminal Underground — Release",
        meta: "RECORD · 2024",
      },
      { id: "A02", title: "Beatport Tech House #6", meta: "CHART · 2024" },
      { id: "A03", title: "Live — Seoul Club Set", meta: "LIVE · 2025" },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "loozbone",
    name: "Loozbone",
    image: "/images/artist/loozbone/profile.webp",
    bio: "Rising electronic dance music artist with a distinctive sound and stage presence, performing across Asia.",
    city: "Seoul",
    selectedWorks: [
      { id: "A01", title: "Asia Tour 2025", meta: "LIVE · 2025" },
      { id: "A02", title: "Bone — Single", meta: "RECORD · 2024" },
      { id: "A03", title: "Live — Seoul", meta: "LIVE · 2024" },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "dearboi",
    name: "DearBoi",
    image: "/images/artist/dearboi/profile.webp",
    bio: "House and tech house DJ based in Seoul with a unique vibe, currently resident at MUSE.",
    city: "Seoul",
    selectedWorks: [
      { id: "A01", title: "MUSE — Resident Set", meta: "LIVE · 2025" },
      { id: "A02", title: "Vibe Sessions Vol.3", meta: "MIX · 2024" },
      { id: "A03", title: "House Crossover EP", meta: "RECORD · 2024" },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "sielo",
    name: "Sielo",
    image: "/images/artist/sielo/profile.webp",
    bio: "DJ and producer making waves in the global Tech House scene since 2020 with releases on labels like In/Rotation, The Myth Of NYX, and Controversia.",
    city: "Seoul",
    selectedWorks: [
      { id: "A01", title: "In/Rotation — EP", meta: "RECORD · 2024" },
      { id: "A02", title: "The Myth Of NYX — Single", meta: "RECORD · 2023" },
      { id: "A03", title: "Controversia — Mix", meta: "MIX · 2025" },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  comingSoon("gongstar", "GONGSTAR", "/images/artist/gongstar/profile.webp"),
  comingSoon("arkins", "ARKINS", "/images/artist/arkins/profile.webp"),
  comingSoon("cheez", "CHEEZ", "/images/artist/cheez/profile.webp"),
  comingSoon("yuka", "YUKA", "/images/artist/yuka/profile.webp"),
  comingSoon("sungyoo", "SUNGYOO", "/images/artist/sungyoo/profile.webp"),
  comingSoon(
    "vandalrock",
    "VANDALROCK",
    "/images/artist/vandalrock/profile.webp",
  ),
  comingSoon("bliss", "BLISS", "/images/artist/bliss/profile.webp"),
  comingSoon("siro", "SIRO", "/images/artist/siro/profile.webp"),
  comingSoon("youkeep", "YOUKEEP", "/images/artist/youkeep/profile.webp"),
  {
    id: "gg",
    name: "GG",
    image: "/images/artist/gg/profile.webp",
    bio: "Coming Soon.",
    city: "Seoul",
    selectedWorks: [{ id: "—", title: "Coming Soon", meta: "—" }],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  comingSoon("tricky", "TRICKY", "/images/artist/tricky/profile.webp"),
  comingSoon("castle-j", "CASTLE J", "/images/artist/castle-j/profile.webp"),
  comingSoon("mollfin", "MOLLFIN", "/images/artist/mollfin/profile.webp"),
  comingSoon("howmini", "HOWMINI", "/images/artist/howmini/profile.webp"),
  comingSoon("he-s", "HE_S", "/images/artist/he-s/profile.webp"),
  comingSoon("juncoco", "JUNCOCO", "/images/artist/juncoco/profile.webp"),
  comingSoon("noju", "NOJU", "/images/artist/noju/profile.webp"),
  comingSoon("yooni", "Yooni", "/images/artist/yooni/profile.webp"),
  comingSoon("preed", "PREED", "/images/artist/preed/profile.webp"),
  // — Existing roster entries not present in art/ —
  {
    id: "aster",
    name: "Aster",
    image: "/images/artist/aster/profile.webp",
    bio: "Coming Soon.",
    city: "Seoul",
    selectedWorks: [{ id: "—", title: "Coming Soon", meta: "—" }],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "breeze",
    name: "Breeze",
    image: "/images/artist/breeze/profile.webp",
    bio: "Coming Soon.",
    city: "Seoul",
    selectedWorks: [{ id: "—", title: "Coming Soon", meta: "—" }],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  {
    id: "jeride",
    name: "Jeride",
    image: "/images/artist/jeride/profile.webp",
    bio: "Coming Soon.",
    city: "Seoul",
    selectedWorks: [{ id: "—", title: "Coming Soon", meta: "—" }],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  // — Non-numbered art/ folders (alphabetical) —
  comingSoon("advanced", "ADVANCED", "/images/artist/advanced/profile.webp"),
  comingSoon("howl", "HOWL", "/images/artist/howl/profile.webp"),
  comingSoon(
    "jeonghyeon",
    "JEONGHYEON",
    "/images/artist/jeonghyeon/profile.webp",
  ),
  comingSoon("kataploks", "kataploks", "/images/artist/kataploks/profile.webp"),
  comingSoon("kyss", "Kyss", "/images/artist/kyss/profile.webp"),
  {
    id: "playmode",
    name: "PLAYMODE",
    image: "/images/artist/playmode/profile.webp",
    bio: "Seoul-based electronic music producer and DJ focused on Tech and Bass House, known for blending diverse sounds across genres.",
    city: "Seoul",
    selectedWorks: [
      { id: "A01", title: "Bass House — EP", meta: "RECORD · 2025" },
      { id: "A02", title: "Tech Crossover Mix", meta: "MIX · 2024" },
      { id: "A03", title: "Live — Seoul", meta: "LIVE · 2025" },
    ],
    socials: [
      {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
      },
      { platform: "instagram", url: "https://www.instagram.com/ye0m_2/" },
      { platform: "soundcloud", url: "https://soundcloud.com/ye0m2" },
      { platform: "spotify", url: "https://open.spotify.com/" },
    ],
  },
  comingSoon("raver", "RAVER", "/images/artist/raver/profile.webp"),
  // RUBATO has logo assets only (no profile yet); image path is a placeholder
  comingSoon("rubato", "RUBATO", "/images/artist/rubato/profile.webp"),
  comingSoon("smasher", "Smasher", "/images/artist/smasher/profile.webp"),
  comingSoon("stefano", "STEFANO", "/images/artist/stefano/profile.webp"),
  comingSoon("varo", "VARO", "/images/artist/varo/profile.webp"),
];
