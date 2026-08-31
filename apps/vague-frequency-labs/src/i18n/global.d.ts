import type en from "../../messages/en.json";

// 메시지 키 오타를 컴파일 타임에 잡는다 (t("typo") → 타입 에러).
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
  }
}
