import "server-only";

/**
 * sharp로 quality 80부터 시작해 ≤1MB가 될 때까지 낮추며 webp로 변환하고,
 * blurDataURL(placeholder)을 함께 생성한다. 서버 전용.
 */
export async function toWebp(
  input: Buffer,
): Promise<{ webp: Buffer; placeholder: string }> {
  void input;
  throw new Error("not implemented (P1 Wave 1)");
}
