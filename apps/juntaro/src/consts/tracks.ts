import type { JuntaroTrack } from "@/types/music";
import { SOCIALS } from "@/consts/socials";

const socialHref = (name: (typeof SOCIALS)[number]["name"]): string =>
  SOCIALS.find((social) => social.name === name)?.href ?? "";

interface TrackLinkSources {
  apple: string;
  /** 곡별 Spotify 트랙 URL. 미확인 시 아티스트 프로필로 폴백. */
  spotify?: string;
  /** 곡별 Beatport 트랙 URL. 미확인 시 아티스트 프로필로 폴백. */
  beatport?: string;
}

/**
 * 스트리밍 플랫폼 버튼 소스. Apple Music·Spotify·Beatport는 곡별 실제 URL로 해석하고,
 * YouTube(채널)·SoundCloud(프로필)와 미확인 곡의 Spotify/Beatport는 SOCIALS로 폴백한다.
 */
const trackLinks = ({ apple, spotify, beatport }: TrackLinkSources): JuntaroTrack["links"] => [
  { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
  { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
  { platform: "Spotify", href: spotify ?? socialHref("Spotify"), iconName: "SiSpotify" },
  { platform: "Apple Music", href: apple, iconName: "SiApple" },
  { platform: "Beatport", href: beatport ?? socialHref("Beatport"), iconName: "SiBeatport" },
];

/**
 * Single source of truth for Juntaro's track list.
 * Apple/iTunes 공개 lookup API(artist id 1020632340)에서 취득한 실제 싱글 최신 15곡.
 * 메타·앨범 아트·트랙 URL(Apple/Spotify/Beatport)은 정적 baking(런타임 fetch 없음).
 * shortDescription은 "장르 · Single · 연도" 메타로 대체. 갱신 시 iTunes API로 재추출한다.
 */
export const TRACKS: JuntaroTrack[] = [
  {
    id: "maluco",
    name: "Maluco",
    artist: "Juntaro & Nessø",
    cover: "/images/tracks/maluco.webp",
    shortDescription: "Dance · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/maluco/6766939606?i=6766939613&uo=4", spotify: "https://open.spotify.com/track/5SBA90aQVRrgeNZwpyvKna", beatport: "https://www.beatport.com/track/maluco/28836111" }),
  },
  {
    id: "addiction",
    name: "Addiction",
    artist: "Juntaro",
    cover: "/images/tracks/addiction.webp",
    shortDescription: "House · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/addiction/6774577654?i=6774577656&uo=4", spotify: "https://open.spotify.com/track/7FoALU3vwwmqTpy6CNMCnf", beatport: "https://www.beatport.com/track/addiction/29131875" }),
  },
  {
    id: "break-it",
    name: "Break It",
    artist: "HILLS & Juntaro",
    cover: "/images/tracks/break-it.webp",
    shortDescription: "House · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/break-it/6766539657?i=6766539658&uo=4", spotify: "https://open.spotify.com/track/05vKwFHsiDpr6zk7rG1qd6", beatport: "https://www.beatport.com/track/break-it/28847823" }),
  },
  {
    id: "rock",
    name: "ROCK",
    artist: "Juntaro",
    cover: "/images/tracks/rock.webp",
    shortDescription: "House · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/rock/1892459097?i=1892459098&uo=4", spotify: "https://open.spotify.com/track/7dQYG7UFZipsvVjW8ZttA3", beatport: "https://www.beatport.com/track/rock/28444125" }),
  },
  {
    id: "hands-on-my-body",
    name: "Hands On My Body",
    artist: "Take Note, Juntaro & LOOZBONE",
    cover: "/images/tracks/hands-on-my-body.webp",
    shortDescription: "House · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/hands-on-my-body/1872132425?i=1872132432&uo=4", spotify: "https://open.spotify.com/track/2HXUcKQ7pnamxMo7wL0oHv", beatport: "https://www.beatport.com/track/hands-on-my-body/23845591" }),
  },
  {
    id: "this-is-how-we-get-it",
    name: "This Is How We Get It",
    artist: "Juntaro",
    cover: "/images/tracks/this-is-how-we-get-it.webp",
    shortDescription: "House · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/this-is-how-we-get-it/1870929221?i=1870929222&uo=4", beatport: "https://www.beatport.com/track/this-is-how-we-get-it/23700393" }),
  },
  {
    id: "da-bass",
    name: "Da Bass",
    artist: "Sielo & Juntaro",
    cover: "/images/tracks/da-bass.webp",
    shortDescription: "Electronic · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/da-bass/1869055175?i=1869055177&uo=4", spotify: "https://open.spotify.com/track/6XvzJa5RsWYew3KgD0C4VT", beatport: "https://www.beatport.com/track/da-bass/23471319" }),
  },
  {
    id: "time-for-the-underground",
    name: "Time For The Underground",
    artist: "Juntaro",
    cover: "/images/tracks/time-for-the-underground.webp",
    shortDescription: "Dance · Single · 2026",
    links: trackLinks({ apple: "https://music.apple.com/us/album/time-for-the-underground/1855006639?i=1855006641&uo=4", spotify: "https://open.spotify.com/track/4VjIzCy9kNx7zNrxzrLExN", beatport: "https://www.beatport.com/track/time-for-the-underground/22763641" }),
  },
  {
    id: "satisfied",
    name: "Satisfied",
    artist: "Juntaro",
    cover: "/images/tracks/satisfied.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/satisfied/1847647228?i=1847647229&uo=4", spotify: "https://open.spotify.com/track/3CQ2QRDzwDsXOVfcgWv8fz", beatport: "https://www.beatport.com/track/satisfied/22309637" }),
  },
  {
    id: "paranoia",
    name: "Paranoia",
    artist: "Juntaro",
    cover: "/images/tracks/paranoia.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/paranoia/1844435834?i=1844435835&uo=4", spotify: "https://open.spotify.com/track/6BayB2ZQFrLNHq6B08iPkH", beatport: "https://www.beatport.com/track/paranoia/22019360" }),
  },
  {
    id: "savage",
    name: "Savage",
    artist: "Juntaro",
    cover: "/images/tracks/savage.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/savage/1837791259?i=1837791262&uo=4", spotify: "https://open.spotify.com/track/32GLdqVDBAkpGk72iHA8qd", beatport: "https://www.beatport.com/track/savage/21560063" }),
  },
  {
    id: "pump-up-the-bassline",
    name: "Pump Up the Bassline",
    artist: "Juntaro",
    cover: "/images/tracks/pump-up-the-bassline.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/pump-up-the-bassline/1838999806?i=1838999808&uo=4", spotify: "https://open.spotify.com/track/1YX6YpL9dRhH8g7IHDkImJ", beatport: "https://www.beatport.com/track/pump-up-the-bassline-/21585060" }),
  },
  {
    id: "ven-a-bailar",
    name: "Ven a Bailar",
    artist: "Alvii Ferrer & Juntaro",
    cover: "/images/tracks/ven-a-bailar.webp",
    shortDescription: "Dance · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/ven-a-bailar/1834957524?i=1834957526&uo=4", spotify: "https://open.spotify.com/track/3FH3ezLPoE6yPH7celnYZD", beatport: "https://www.beatport.com/track/ven-a-bailar/21302807" }),
  },
  {
    id: "esto-ta-duro",
    name: "Esto Ta Duro",
    artist: "Black V Neck & Juntaro",
    cover: "/images/tracks/esto-ta-duro.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/esto-ta-duro-radio-mix/1810680095?i=1810680096&uo=4", spotify: "https://open.spotify.com/track/6q0duMuV6OBSD6uGVxEQR3", beatport: "https://www.beatport.com/track/esto-ta-duro/20433844" }),
  },
  {
    id: "move",
    name: "Move",
    artist: "Juntaro",
    cover: "/images/tracks/move.webp",
    shortDescription: "House · Single · 2025",
    links: trackLinks({ apple: "https://music.apple.com/us/album/move-extended-mix/1791060740?i=1791060741&uo=4", spotify: "https://open.spotify.com/track/00poJcdrFBLT1flLBOXO2f", beatport: "https://www.beatport.com/track/move/20008945" }),
  },
];
