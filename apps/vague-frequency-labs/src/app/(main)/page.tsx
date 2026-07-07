import { createMetadata } from "@/utils/index";
import { getWorldMapData } from "@/utils/world-map-data";
import About from "../sections/about/about";
import MediaGridWork from "../sections/mediaGrid/MediaGridWork";
import MusicList from "../sections/musicList/MusicList";
import Hero from "../sections/hero/hero";
import Loader from "./loader";
import { LoaderProvider } from "./loader-context";

const description =
  "Vague Frequency Laboratory is an independent Seoul electronic music label spotlighting experimental tech house and bass house artists, releases, and live sets.";

export const metadata = createMetadata({
  description,
  keywords: ["Tech House", "Bass House", "Electronic Music", "Music Label", "Seoul", "DJ"],
  openGraph: {
    url: "/",
    description,
  },
  twitter: {
    description,
  },
  alternates: {
    canonical: "/",
  },
});

export default function Home() {
  // Shared with the loader via React cache(); the dotted-map build runs once.
  // Loader가 같은 pointsFlat 배열 참조를 넘기므로 Flight가 참조 dedupe —
  // 홈 payload에 좌표는 1회만 직렬화된다 (복사본을 만들면 배가되니 주의).
  // LoaderProvider(done 신호)는 소비자가 Loader·Hero뿐이라 layout이 아닌
  // 여기서 감싼다 — 서브페이지는 로더 관련 코드를 전혀 싣지 않는다.
  const mapData = getWorldMapData();
  return (
    <LoaderProvider>
      <Loader
        mapData={{
          pointsFlat: mapData.pointsFlat,
          width: mapData.width,
          height: mapData.height,
        }}
      />
      <main className="flex-1">
        <Hero mapData={mapData} />
        <About />
        <MediaGridWork />
        <MusicList />
      </main>
    </LoaderProvider>
  );
}
