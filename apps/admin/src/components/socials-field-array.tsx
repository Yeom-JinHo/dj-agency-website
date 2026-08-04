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
 * socials 필드어레이 카드(artist·release 공용). control은 상위 <Form>(FormProvider)
 * 컨텍스트에서 받아 폼 전체 값 타입에 결합하지 않는다 — socials 부분만 알면 된다.
 */
export function SocialsFieldArray() {
  const { control } = useFormContext<SocialsFormValues>();
  const socials = useFieldArray({ control, name: "socials" });

  return (
    <Card className="gap-4 py-4">
      {/* 섹션 제목 text-lg + 구분선 — 페이지 제목(text-2xl)과 필드 라벨(text-sm) 사이에
          한 단씩 벌려야 카드가 이어지는 폼에서 섹션 경계가 잡힌다(text-base는 라벨과
          한 단 차이뿐이었다). border-b는 CardHeader의 [.border-b]:pb-6 훅을 깨우는데,
          카드는 py-4 리듬이지만 pb-4로 덮으려면 !important가 필요하고(훅 선택자가 :is()로
          한 단 높다) 이 앱엔 그 선례가 없어 24px을 그대로 받아들인다. */}
      <CardHeader className="border-b">
        <h2 className="text-lg font-semibold">소셜</h2>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 빈 카피는 "소셜이 없습니다" 대신 행의 실체(링크)로 말한다. */}
        {socials.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            등록된 링크가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {socials.fields.map((row, index) => (
              <div key={row.id} className="flex items-start gap-2">
                <FormField
                  control={control}
                  name={`socials.${index}.platform`}
                  render={({ field }) => (
                    <FormItem className="w-40 shrink-0">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                        <Input placeholder="https://…" {...field} />
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
                  aria-label="소셜 제거"
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
