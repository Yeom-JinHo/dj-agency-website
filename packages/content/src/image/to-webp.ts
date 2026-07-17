import "server-only";
import sharp from "sharp";

const MAX_BYTES = 1024 * 1024; // 1MB (CLAUDE.md 이미지 규약)
const START_QUALITY = 80;
const MIN_QUALITY = 40;
const QUALITY_STEP = 10;
// quality 바닥(40)에서도 초과하면 최대 변을 단계 축소하며 재시도.
const MAX_DIMENSIONS = [2400, 2000, 1600, 1200] as const;

/** quality 80부터 ≤1MB가 될 때까지 낮추며 webp로 인코딩. */
async function encodeStepDown(input: Buffer): Promise<Buffer> {
  let quality = START_QUALITY;
  let webp = await sharp(input).webp({ quality }).toBuffer();
  while (webp.byteLength > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    webp = await sharp(input).webp({ quality }).toBuffer();
  }
  return webp;
}

/**
 * sharp로 webp(≤1MB) 변환 + blurDataURL(placeholder) 생성. 서버 전용.
 * quality 스텝다운으로 부족하면 최대 변을 단계 축소하며 재시도해 ≤1MB를 보장하고,
 * 그래도 초과하면 명시적으로 throw한다(CLAUDE.md 규약: webp ≤1MB).
 */
export async function toWebp(
  input: Buffer,
): Promise<{ webp: Buffer; placeholder: string }> {
  let webp = await encodeStepDown(input);

  if (webp.byteLength > MAX_BYTES) {
    for (const dim of MAX_DIMENSIONS) {
      const resized = await sharp(input)
        .resize(dim, dim, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
      webp = await encodeStepDown(resized);
      if (webp.byteLength <= MAX_BYTES) break;
    }
  }

  if (webp.byteLength > MAX_BYTES) {
    throw new Error(
      `toWebp: ≤1MB 변환 실패 (최소 품질 ${MIN_QUALITY}·최소 치수 ${MAX_DIMENSIONS.at(-1)}px에서도 ${webp.byteLength} bytes)`,
    );
  }

  const blur = await sharp(input)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const placeholder = `data:image/webp;base64,${blur.toString("base64")}`;

  return { webp, placeholder };
}
