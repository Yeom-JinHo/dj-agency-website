import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { artistProfile } from "@/source";

// opengraph-image 컨벤션 파일 대신 일반 route handler를 쓰는 이유:
// 1) 팩토리(createMetadata) 기본 og:image가 컨벤션 자동 태그를 덮어써서
//    어차피 명시 배선이 필요하고 (PR #94에서 실측된 관례),
// 2) 컨벤션 라우트 URL엔 빌드 해시(-h78zlb류)가 붙어 명시 참조가 취약하다.
// 이 라우트는 /artist/<name>/og 로 안정적으로 서빙된다.

export function generateStaticParams() {
  return artistProfile.getPages().map((artist) => ({
    artistName: artist.name,
  }));
}

// 6명 전원 빌드 타임 프리렌더로 고정 — sharp(webp→jpeg 변환)가 런타임에
// 실행될 일이 없도록 미지의 params는 404 처리한다.
export const dynamicParams = false;

const WIDTH = 1200;
const HEIGHT = 630;
// 다크 테마 토큰 값 고정 — satori는 CSS 변수를 못 읽는다.
// background: hsl(240 10% 3.9%), foreground: hsl(47 19% 91%)
const BG = "#09090B";
const FG = "#ECE9DF";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ artistName: string }> }
) {
  const { artistName } = await ctx.params;
  const artist = artistProfile.getPage(decodeURIComponent(artistName));
  if (!artist) return new Response("Not Found", { status: 404 });

  const slug = artist.name.toLowerCase();
  const [anton, photo] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/Anton-Regular.ttf")),
    readFile(
      path.join(process.cwd(), `public/images/artist/${slug}/profile.webp`)
    ),
  ]);
  // satori는 webp를 디코드하지 못해 빌드 타임에 jpeg로 변환한다.
  // 우측 컬럼 표시 크기(470×630)의 2배로 리사이즈해 데이터 URI를 가볍게 유지.
  const { default: sharp } = await import("sharp");
  const jpeg = await sharp(photo)
    .resize(940, 1260, { fit: "cover" })
    .jpeg({ quality: 82 })
    .toBuffer();
  const photoSrc = `data:image/jpeg;base64,${jpeg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: BG,
          color: FG,
          fontFamily: "Anton",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px 64px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.22em",
              opacity: 0.72,
            }}
          >
            VAGUE FREQUENCY LABORATORY
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                width: 88,
                height: 5,
                backgroundColor: FG,
                marginBottom: 32,
              }}
            />
            <div
              style={{
                fontSize: artist.name.length > 8 ? 118 : 150,
                lineHeight: 0.95,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
              }}
            >
              {artist.name}
            </div>
          </div>
        </div>
        {/* 세로(2:3) 원본을 우측 컬럼에 cover 크롭 — 1200×630 강제 크롭으로
            얼굴이 잘리던 기존 문제를 카드 구도로 해소한다.
            satori JSX라 next/image를 쓸 수 없다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          width={470}
          height={630}
          alt=""
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Anton", data: anton, weight: 400, style: "normal" }],
    }
  );
}
