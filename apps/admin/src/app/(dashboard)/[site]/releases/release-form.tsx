"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { PLATFORM_LINK_KEYS, type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { useEntityFormSubmit } from "@/lib/use-entity-form-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormActions } from "@/components/form-actions";
import { SocialsFieldArray } from "@/components/socials-field-array";
import {
  EMPTY_IMAGE_FIELD,
  ImageField,
  isImageFieldDirty,
  type ImageFieldValue,
} from "@/components/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { releaseFormSchema, type ReleaseFormValues } from "./schema";
import { createRelease, updateRelease } from "./actions";

/** platform_links 입력 라벨(표시 전용). */
const PLATFORM_LABELS: Record<(typeof PLATFORM_LINK_KEYS)[number], string> = {
  beatport: "Beatport",
  spotify: "Spotify",
  appleMusic: "Apple Music",
  soundcloud: "SoundCloud",
  youtubeMusic: "YouTube Music",
};

/** primaryArtistId select에서 "없음"을 나타내는 sentinel(Radix Select는 빈 문자열 값 금지). */
const NO_ARTIST = "__none__";

interface ReleaseFormProps {
  mode: "create" | "edit";
  /** 현재 사이트 — 액션·리다이렉트 경로에 쓰인다(소속 모델). */
  site: SiteSlug;
  releaseId?: string;
  /** edit 모드: 기존 slug(불변, 읽기 전용 표시). */
  slug?: string;
  defaultValues: ReleaseFormValues;
  /** primary artist select 옵션(같은 사이트 소속 로스터). */
  artists: { id: string; name: string }[];
  initialArtworkUrl?: string | null;
}

export function ReleaseForm({
  mode,
  site,
  releaseId,
  slug,
  defaultValues,
  artists,
  initialArtworkUrl = null,
}: ReleaseFormProps) {
  const listHref = `/${site}/releases`;
  const [artwork, setArtwork] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);

  const form = useForm<ReleaseFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(releaseFormSchema),
    defaultValues,
  });

  const titleValue = form.watch("title");
  const slugPreview = mode === "create" ? slugify(titleValue) : (slug ?? "");
  const slugFieldId = useId();

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    form,
    mode,
    listHref,
    createdMessage: "릴리즈를 만들었습니다.",
    // 파일 선택·제거는 RHF 밖 상태라 isDirty에 안 잡힌다 — 함께 미저장으로 취급.
    hasUnsaved: form.formState.isDirty || isImageFieldDirty(artwork),
    buildFormData: (values: ReleaseFormValues) => {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(values));
      if (artwork.file) fd.set("artworkImage", artwork.file);
      if (artwork.removed) fd.set("removeArtworkImage", "1");
      return fd;
    },
    create: (fd) => createRelease(site, fd),
    update: (fd) => updateRelease(site, releaseId!, fd),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* 제출 중 전체 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다.
            max-w-4xl: 사이드바(16rem)+콘텐츠 패딩과 합쳐 1200px — 1366 노트북까지 들어가고
            사이드바 도입 전 값(2xl)이 남기던 우측 여백을 회수한다. 긴 텍스트의 measure는
            설명 카드의 2열 그리드가 잡는다(한 열 ≈55자). 스켈레톤도 같은 폭이어야 한다. */}
        <fieldset disabled={submitting} className="max-w-4xl min-w-0 space-y-6">
        {/* 기본 정보 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-base font-semibold">기본 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="릴리즈 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* slug는 RHF 필드가 아니라 제목에서 파생되는 읽기 전용 표시라 FormItem/FormLabel을 쓰지 않는다 —
                FormLabel의 htmlFor는 FormControl이 부여하는 id를 가리키는데 여기엔 FormControl이 없어
                라벨이 존재하지 않는 id를 가리키고 있었다(스크린리더가 이름 없는 필드로 읽음).
                RHF 관여가 없으니 일반 Label + useId로 직접 연결한다. 마크업(grid gap-2)은 FormItem과 동일. */}
            <div className="grid gap-2">
              <Label htmlFor={slugFieldId}>Slug</Label>
              <Input
                id={slugFieldId}
                value={slugPreview}
                readOnly
                disabled
                className="font-mono"
              />
              <p className="text-muted-foreground text-xs">
                {mode === "create"
                  ? "제목에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                  : "slug는 생성 후 변경할 수 없습니다."}
              </p>
            </div>

            <FormField
              control={form.control}
              name="primaryArtistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주요 아티스트</FormLabel>
                  <Select
                    value={field.value === "" ? NO_ARTIST : field.value}
                    onValueChange={(v) =>
                      field.onChange(v === NO_ARTIST ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="아티스트 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_ARTIST}>없음</SelectItem>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    이 사이트 소속 로스터의 아티스트. 로스터 밖 표기는 아티스트
                    크레딧을 사용하세요.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artistCredit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아티스트 크레딧</FormLabel>
                  <FormControl>
                    <Input placeholder="예: Sam Collins" {...field} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    로스터에 없는 외부 아티스트 표시용 자유 텍스트.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featuredArtists"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>피처링 아티스트</FormLabel>
                  <FormControl>
                    <Input placeholder="콤마로 구분 (예: A, B, C)" {...field} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    콤마로 구분해 여러 명을 입력할 수 있습니다.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>레이블</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="catalogNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카탈로그 번호</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>발매일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="w-48" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정렬 순서</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="w-32"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      사이트 내 노출 순서(작을수록 먼저).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 설명 (en/ko × short/full) */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-base font-semibold">설명</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["shortDescriptionEn", "짧은 설명 (EN)"],
                  ["shortDescriptionKo", "짧은 설명 (KO)"],
                  ["fullDescriptionEn", "전체 설명 (EN)"],
                  ["fullDescriptionKo", "전체 설명 (KO)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={name.startsWith("full") ? 5 : 2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform links (5개 확정 키) */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-base font-semibold">플랫폼 링크</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {PLATFORM_LINK_KEYS.map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`platformLinks.${key}`}
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3">
                      <FormLabel className="mt-2.5 w-28 shrink-0">
                        {PLATFORM_LABELS[key]}
                      </FormLabel>
                      <div className="flex-1 space-y-1">
                        <FormControl>
                          <Input placeholder="https://…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <SocialsFieldArray />

        {/* 이미지 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-base font-semibold">아트워크</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageField
              label="아트워크 이미지"
              initialUrl={initialArtworkUrl}
              value={artwork}
              onChange={setArtwork}
            />
          </CardContent>
        </Card>

        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "릴리즈 만들기"
                : "변경사항 저장"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        </FormActions>
        </fieldset>
      </form>
    </Form>
  );
}
