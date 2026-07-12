import { notFound } from "next/navigation";

// [locale] 하위 미지 경로를 브랜드 404([locale]/not-found.tsx)로 보낸다.
export default function CatchAllPage() {
  notFound();
}
