const PLAYLIST_ID = "5tdvU4HjA0pxO5Qv3qC4As";

const SOUNDCLOUD_URL =
  "https://soundcloud.com/juntaromusic/sets/no-time-to-talk";

const playlist = {
  spotify: {
    url: `https://open.spotify.com/playlist/${PLAYLIST_ID}`,
    embedSrc: `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`,
  },
  soundcloud: {
    url: SOUNDCLOUD_URL,
    embedSrc: `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      SOUNDCLOUD_URL,
    )}&visual=true&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
  },
};

export { playlist };
