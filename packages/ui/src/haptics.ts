import { WebHaptics } from "web-haptics";

const PRESETS = {
  tap: undefined,
  success: "success",
} as const;

export type HapticKind = keyof typeof PRESETS;

// 인스턴스마다 숨은 DOM 노드를 하나 만들고, 컴포넌트 밖(훅·콜백)에서도 호출해야 하므로
// 라이브러리 React 훅 대신 모듈 싱글턴을 쓴다.
let instance: WebHaptics | null = null;

export function haptic(kind: HapticKind): void {
  if (typeof window === "undefined") return;
  instance ??= new WebHaptics();
  void instance.trigger(PRESETS[kind]);
}
