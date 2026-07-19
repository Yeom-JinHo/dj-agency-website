import type { Artist, ArtistSocial } from "@/types/artist";

import advancedProfile from "../../public/images/artist/advanced/profile.webp";
import arkinsProfile from "../../public/images/artist/arkins/profile.webp";
import asterProfile from "../../public/images/artist/aster/profile.webp";
import blissProfile from "../../public/images/artist/bliss/profile.webp";
import breezeProfile from "../../public/images/artist/breeze/profile.webp";
import castleJProfile from "../../public/images/artist/castle-j/profile.webp";
import cheezProfile from "../../public/images/artist/cheez/profile.webp";
import dearboiProfile from "../../public/images/artist/dearboi/profile.webp";
import ggProfile from "../../public/images/artist/gg/profile.webp";
import gongstarProfile from "../../public/images/artist/gongstar/profile.webp";
import heSProfile from "../../public/images/artist/he-s/profile.webp";
import howlProfile from "../../public/images/artist/howl/profile.webp";
import howminiProfile from "../../public/images/artist/howmini/profile.webp";
import jeonghyeonProfile from "../../public/images/artist/jeonghyeon/profile.webp";
import jerideProfile from "../../public/images/artist/jeride/profile.webp";
import juncocoProfile from "../../public/images/artist/juncoco/profile.webp";
import juntaroProfile from "../../public/images/artist/juntaro/profile.webp";
import kataploksProfile from "../../public/images/artist/kataploks/profile.webp";
import kyssProfile from "../../public/images/artist/kyss/profile.webp";
import loozboneProfile from "../../public/images/artist/loozbone/profile.webp";
import mollfinProfile from "../../public/images/artist/mollfin/profile.webp";
import nojuProfile from "../../public/images/artist/noju/profile.webp";
import playmodeProfile from "../../public/images/artist/playmode/profile.webp";
import preedProfile from "../../public/images/artist/preed/profile.webp";
import raverProfile from "../../public/images/artist/raver/profile.webp";
import samProfile from "../../public/images/artist/sam/profile.webp";
import sieloProfile from "../../public/images/artist/sielo/profile.webp";
import siroProfile from "../../public/images/artist/siro/profile.webp";
import smasherProfile from "../../public/images/artist/smasher/profile.webp";
import stefanoProfile from "../../public/images/artist/stefano/profile.webp";
import sungyooProfile from "../../public/images/artist/sungyoo/profile.webp";
import trickyProfile from "../../public/images/artist/tricky/profile.webp";
import vandalrockProfile from "../../public/images/artist/vandalrock/profile.webp";
import varoProfile from "../../public/images/artist/varo/profile.webp";
import yooniProfile from "../../public/images/artist/yooni/profile.webp";
import youkeepProfile from "../../public/images/artist/youkeep/profile.webp";
import yukaProfile from "../../public/images/artist/yuka/profile.webp";

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

const comingSoon = (
  id: string,
  name: string,
  image?: Artist["image"]
): Artist => ({
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
    image: samProfile,
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
    image: juntaroProfile,
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
    image: loozboneProfile,
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
    image: dearboiProfile,
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
    image: sieloProfile,
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
  comingSoon("gongstar", "GONGSTAR", gongstarProfile),
  comingSoon("arkins", "ARKINS", arkinsProfile),
  comingSoon("cheez", "CHEEZ", cheezProfile),
  comingSoon("yuka", "YUKA", yukaProfile),
  comingSoon("sungyoo", "SUNGYOO", sungyooProfile),
  comingSoon("vandalrock", "VANDALROCK", vandalrockProfile),
  comingSoon("bliss", "BLISS", blissProfile),
  comingSoon("siro", "SIRO", siroProfile),
  comingSoon("youkeep", "YOUKEEP", youkeepProfile),
  {
    id: "gg",
    name: "GG",
    image: ggProfile,
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
  comingSoon("tricky", "TRICKY", trickyProfile),
  comingSoon("castle-j", "CASTLE J", castleJProfile),
  comingSoon("mollfin", "MOLLFIN", mollfinProfile),
  comingSoon("howmini", "HOWMINI", howminiProfile),
  comingSoon("he-s", "HE_S", heSProfile),
  comingSoon("juncoco", "JUNCOCO", juncocoProfile),
  comingSoon("noju", "NOJU", nojuProfile),
  comingSoon("yooni", "Yooni", yooniProfile),
  comingSoon("preed", "PREED", preedProfile),
  // — Existing roster entries not present in art/ —
  {
    id: "aster",
    name: "Aster",
    image: asterProfile,
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
    image: breezeProfile,
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
    image: jerideProfile,
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
  comingSoon("advanced", "ADVANCED", advancedProfile),
  comingSoon("howl", "HOWL", howlProfile),
  comingSoon("jeonghyeon", "JEONGHYEON", jeonghyeonProfile),
  comingSoon("kataploks", "kataploks", kataploksProfile),
  comingSoon("kyss", "Kyss", kyssProfile),
  {
    id: "playmode",
    name: "PLAYMODE",
    image: playmodeProfile,
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
  comingSoon("raver", "RAVER", raverProfile),
  // RUBATO has logo assets only (no profile yet); no portrait image available
  comingSoon("rubato", "RUBATO"),
  comingSoon("smasher", "Smasher", smasherProfile),
  comingSoon("stefano", "STEFANO", stefanoProfile),
  comingSoon("varo", "VARO", varoProfile),
];
