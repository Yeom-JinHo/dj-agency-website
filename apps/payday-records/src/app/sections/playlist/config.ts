const PLAYLIST_ID = "5tdvU4HjA0pxO5Qv3qC4As";

// TODO: payday-records 공식 SoundCloud URL로 교체. 트랙/셋/사용자 페이지 어떤 URL이든 그대로 넣으면 된다.
const SOUNDCLOUD_URL = "https://soundcloud.com/soundcloud";

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
