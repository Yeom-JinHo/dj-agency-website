/**
 * track.name을 기반으로 결정적으로 비닐랩 텍스처를 고른다. 카드(MusicCard)와
 * 모달(TrackModal)이 같은 트랙에 항상 같은 질감을 쓰도록 공유되는 순수 함수.
 */
export function getTrackTexture(name: string): string {
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const textureNumber = (Math.abs(hash) % 3) + 1;
  return `/images/texture/${textureNumber}.webp`;
}
