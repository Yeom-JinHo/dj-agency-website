import { FormLoadingSkeleton } from "@/components/form-loading-skeleton";

export default function EditReleaseLoading() {
  // 릴리즈는 아트워크가 기본 정보 카드 최상단이라 스켈레톤도 이미지로 시작한다.
  return <FormLoadingSkeleton />;
}
