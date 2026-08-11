"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { SOCIAL_PLATFORMS, type Social } from "@repo/content/schema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

/** artist·release 폼이 공유하는 socials 부분. 두 폼 스키마의 socials shape이 같다. */
interface SocialsFormValues {
  socials: Social[];
}

/** 셀렉트 표시용 정식 표기 — 저장 값은 소문자 enum 그대로 두고 표기만 매핑한다.
 *  릴리즈 폼의 플랫폼 링크(Beatport·Apple Music…)가 정식 표기를 쓰는데 여기만
 *  원시값(instagram)이 노출돼 같은 개념이 두 표기로 갈렸다(designer 독립 리뷰). */
const PLATFORM_DISPLAY: Record<(typeof SOCIAL_PLATFORMS)[number], string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  beatport: "Beatport",
  appleMusic: "Apple Music",
  youtubeMusic: "YouTube Music",
  bandcamp: "Bandcamp",
  tiktok: "TikTok",
  x: "X",
  website: "웹사이트",
};

/**
 * socials 필드어레이(artist·release 공용). control은 상위 <Form>(FormProvider)
 * 컨텍스트에서 받아 폼 전체 값 타입에 결합하지 않는다 — socials 부분만 알면 된다.
 *
 * variant는 이 섹션이 카드 자체인지, 다른 카드 안의 한 블록인지를 정한다.
 * artist는 소셜이 독립 카드지만(`card`), release는 "링크" 카드 안에서 발매
 * 플랫폼과 나란히 서야 해서(`block`) 카드 껍데기 없이 제목 한 줄만 쓴다.
 * 필드어레이 인스턴스는 하나여야 하므로(같은 name에 useFieldArray를 두 번 걸면
 * 두 목록이 어긋난다) 껍데기만 분기하고 본문은 공유한다.
 */
export function SocialsFieldArray({
  variant = "card",
}: {
  variant?: "card" | "block";
} = {}) {
  const { control } = useFormContext<SocialsFormValues>();
  const socials = useFieldArray({ control, name: "socials" });

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        socials.append({ platform: "instagram", url: "", label: "" })
      }
    >
      <PlusIcon /> 추가
    </Button>
  );

  const rows = (
    <>
      {/* 빈 카피는 "소셜이 없습니다" 대신 행의 실체(링크)로 말한다. */}
      {socials.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            등록된 링크가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {/* 컬럼 헤더 한 줄 — 반복 행마다 FormLabel을 붙이면 4행 × 3필드로 라벨이
                12개가 되어 카드가 라벨로 덮인다. 그렇다고 aria-label만 달면 시각
                사용자는 값이 채워져 placeholder가 사라지는 순간 "@ye0m_2"가 URL인지
                표시 이름인지 알 수 없다 — 그 문제는 화면에 남는 헤더만 풀 수 있다.
                aria-hidden인 이유: 같은 이름이 이미 컨트롤마다 aria-label로 가 있어
                보조기기에는 중복 낭독일 뿐이다.
                폭은 아래 행과 같은 값(w-40 / flex-1 / w-36 + 버튼 자리 size-9)을
                써야 컬럼이 어긋나지 않는다 — 행 마크업을 고치면 여기도 함께 고칠 것. */}
            <div
              aria-hidden
              className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
            >
              <span className="w-40 shrink-0">플랫폼</span>
              <span className="flex-1">URL</span>
              {/* 세 번째 컬럼은 스키마 필드명(label)이 아니라 placeholder가 말하는
                  용도("표시 이름")로 부른다 — 화면에 두 표기가 공존하면 안 된다.
                  "(선택)"은 헤더로 올리지 않는다: 선택 여부가 의미 있는 건 비어
                  있을 때뿐이고 그때는 placeholder가 그대로 보인다. */}
              <span className="w-36 shrink-0">표시 이름</span>
              <span className="size-9 shrink-0" />
            </div>
            {socials.fields.map((row, index) => (
              <div key={row.id} className="flex items-start gap-2">
                <FormField
                  control={control}
                  name={`socials.${index}.platform`}
                  render={({ field }) => (
                    <FormItem className="w-40 shrink-0">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          {/* 행 번호를 이름에 넣는다 — "URL"만 네 번 읽히면 스크린리더
                              사용자는 몇 번째 소셜을 편집 중인지 알 수 없다. 접두사는
                              카드 제목과 같은 "소셜"로 간다: 빈 카피만 행의 실체(링크)를
                              말할 뿐 섹션 이름은 소셜이고, "링크 1 URL"은 동어반복이다.
                              트리거는 선택값을 텍스트로 갖고 있어 aria-label이 그 값을
                              이름 자리에서 밀어내지만, 값은 combobox 값으로 따로 낭독된다
                              — PLATFORM_DISPLAY 도입 후로는 그 값이 "Instagram"이라
                              화면에 보이는 표기와 낭독이 같아졌다(종전엔 원시값이었다).
                              site-switcher가 이미 쓰는 처방이다. */}
                          <SelectTrigger
                            className="w-full"
                            aria-label={`소셜 ${index + 1} 플랫폼`}
                          >
                            <SelectValue placeholder="플랫폼" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {PLATFORM_DISPLAY[platform]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`socials.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="https://…"
                          aria-label={`소셜 ${index + 1} URL`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`socials.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="w-36 shrink-0">
                      <FormControl>
                        {/* "라벨"만으로는 무슨 라벨인지 알 수 없었다 — 용도(표시
                            이름)와 선택 사항임을 placeholder가 직접 말한다. */}
                        <Input
                          placeholder="표시 이름 (선택)"
                          aria-label={`소셜 ${index + 1} 표시 이름`}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => socials.remove(index)}
                  // 입력들이 행 번호로 불리는데 제거 버튼만 "소셜 제거"면 어느 행이
                  // 사라지는지 모른 채 파괴적 동작을 누르게 된다 — 같은 어휘로 맞춘다.
                  aria-label={`소셜 ${index + 1} 제거`}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        )}
    </>
  );

  if (variant === "block") {
    return (
      <div className="space-y-3">
        {/* 블록 제목은 카드 제목(h2)보다 한 단 아래다 — 색으로 필드 라벨(같은 크기,
            foreground)과 갈라 놓는다. 크기를 더 줄이면 아래 컬럼 헤더(text-xs)와
            같은 단이 되어 제목과 헤더가 구분되지 않는다. */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-muted-foreground text-sm font-medium">소셜</h3>
          {addButton}
        </div>
        {rows}
      </div>
    );
  }

  return (
    <Card className="gap-4 py-4">
      {/* 섹션 제목 text-lg + 구분선 — 페이지 제목(text-2xl)과 필드 라벨(text-sm) 사이에
          한 단씩 벌려야 카드가 이어지는 폼에서 섹션 경계가 잡힌다(text-base는 라벨과
          한 단 차이뿐이었다). border-b는 CardHeader의 [.border-b]:pb-6 훅을 깨우는데,
          카드는 py-4 리듬이지만 pb-4로 덮으려면 !important가 필요하고(훅 선택자가 :is()로
          한 단 높다) 이 앱엔 그 선례가 없어 24px을 그대로 받아들인다. */}
      <CardHeader className="border-b">
        <h2 className="text-lg font-semibold">소셜</h2>
        <CardAction>{addButton}</CardAction>
      </CardHeader>
      <CardContent className="space-y-3">{rows}</CardContent>
    </Card>
  );
}
