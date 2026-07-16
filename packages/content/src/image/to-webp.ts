import "server-only";
import sharp from "sharp";

const MAX_BYTES = 1024 * 1024; // 1MB (CLAUDE.md 이미지 규약)
const START_QUALITY = 80;
const MIN_QUALITY = 40;
const QUALITY_STEP = 10;

/**
 * sharp로 quality 80부터 시작해 ≤1MB가 될 때까지 낮추며 webp로 변환하고,
 * blurDataURL(placeholder)을 함께 생성한다. 서버 전용.
 */
export async function toWebp(
  input: Buffer,
): Promise<{ webp: Buffer; placeholder: string }> {
  let quality = START_QUALITY;
  let webp = await sharp(input).webp({ quality }).toBuffer();
  while (webp.byteLength > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    webp = await sharp(input).webp({ quality }).toBuffer();
  }

  const blur = await sharp(input)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const placeholder = `data:image/webp;base64,${blur.toString("base64")}`;

  return { webp, placeholder };
}
