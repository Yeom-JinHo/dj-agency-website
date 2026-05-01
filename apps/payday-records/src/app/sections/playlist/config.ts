const PLAYLIST_ID = "5tdvU4HjA0pxO5Qv3qC4As";
const SOUNDCLOUD_URL =
  "https://soundcloud.com/juntaromusic/sets/no-time-to-talk";

const buildSoundcloudSrc = (params: string) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    SOUNDCLOUD_URL,
  )}&${params}`;

const baseSoundcloudParams =
  "auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true";

const playlist = {
  spotify: {
    url: `https://open.spotify.com/playlist/${PLAYLIST_ID}`,
    embedSrc: `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`,
  },
  soundcloud: {
    url: SOUNDCLOUD_URL,
    variants: [
      {
        label: "Visual",
        meta: "visual=true",
        height: 450,
        embedSrc: buildSoundcloudSrc(`visual=true&${baseSoundcloudParams}`),
        darkFilter: false,
      },
      {
        label: "Classic (dark)",
        meta: "visual=false, CSS invert로 흰 배경 → 다크 강제",
        height: 300,
        embedSrc: buildSoundcloudSrc(
          `visual=false&show_artwork=true&${baseSoundcloudParams}`,
        ),
        darkFilter: true,
      },
    ],
  },
};

export { playlist };
