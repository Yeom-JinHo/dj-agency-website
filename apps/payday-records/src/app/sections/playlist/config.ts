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
        meta: "visual=true (현재 기본)",
        height: 450,
        embedSrc: buildSoundcloudSrc(`visual=true&${baseSoundcloudParams}`),
      },
      {
        label: "Classic",
        meta: "visual=false, SoundCloud 시그니처 파형",
        height: 300,
        embedSrc: buildSoundcloudSrc(
          `visual=false&show_artwork=true&${baseSoundcloudParams}`,
        ),
      },
      {
        label: "Mini",
        meta: "visual=false, height=20",
        height: 20,
        embedSrc: buildSoundcloudSrc(
          "visual=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&show_artwork=false&auto_play=false&hide_related=false",
        ),
      },
      {
        label: "Visual + #A07CFE",
        meta: "visual=true, color=A07CFE (사이트 톤 매칭)",
        height: 450,
        embedSrc: buildSoundcloudSrc(
          `visual=true&color=%23A07CFE&${baseSoundcloudParams}`,
        ),
      },
      {
        label: "Classic + #A07CFE",
        meta: "visual=false, color=A07CFE",
        height: 300,
        embedSrc: buildSoundcloudSrc(
          `visual=false&color=%23A07CFE&show_artwork=true&${baseSoundcloudParams}`,
        ),
      },
    ],
  },
};

export { playlist };
