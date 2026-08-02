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
        {socials.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            등록된 소셜이 없습니다.
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
                              {platform}
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
                    <FormItem className="w-32 shrink-0">
                      <FormControl>
                        <Input
                          placeholder="라벨"
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
