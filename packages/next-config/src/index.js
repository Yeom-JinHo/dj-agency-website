import baseConfig from "./base.js";

export { default as baseConfig } from "./base.js";

/**
 * 공통 베이스 설정과 앱별 오버라이드를 병합한 Next.js 설정을 반환합니다.
 * 중첩 객체(images, experimental 등)는 얕게 머지되므로, 필요 시 오버라이드에서
 * 전체 객체를 직접 구성하세요.
 *
 * @param {import('next').NextConfig} [overrides]
 * @returns {import('next').NextConfig}
 */
export function createNextConfig(overrides = {}) {
  return { ...baseConfig, ...overrides };
}
