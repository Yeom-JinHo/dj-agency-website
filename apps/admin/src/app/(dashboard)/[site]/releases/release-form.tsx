"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  SOCIAL_PLATFORMS,
  PLATFORM_LINK_KEYS,
  type SiteSlug,
} from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/form-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

/** 파일 선택 + 미리보기(업로드 전 클라이언트 표시, §4.4). */
function ImageField({
  label,
  initialUrl,
  file,
  onFile,
}: {
  label: string;
  initialUrl: string | null;
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {preview ? (
            <Image
              src={preview}
              alt={label}
              width={80}
              height={80}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-xs">No image</span>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
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
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);

  const form = useForm<ReleaseFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(releaseFormSchema),
    defaultValues,
  });

  const socials = useFieldArray({ control: form.control, name: "socials" });

  const titleValue = form.watch("title");
  const slugPreview = mode === "create" ? slugify(titleValue) : (slug ?? "");

  async function onSubmit(values: ReleaseFormValues) {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("payload", JSON.stringify(values));
    if (artworkFile) fd.set("artworkImage", artworkFile);

    const result =
      mode === "create"
        ? await createRelease(site, fd)
        : await updateRelease(site, releaseId!, fd);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // 부분 성공(생성됐지만 이미지 저장 실패): 편집 화면으로 안내해 이어서 저장.
    if (result.warning && result.id) {
      toast.warning(result.warning);
      router.push(`/${site}/releases/${result.id}`);
      router.refresh();
      return;
    }
    toast.success(
      mode === "create" ? "릴리즈를 만들었습니다." : "변경사항을 저장했습니다.",
    );
    router.push(`/${site}/releases`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8"
      >
        {/* 기본 정보 */}
        <section className="space-y-4">
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

          <FormItem>
            <FormLabel>Slug</FormLabel>
            <Input value={slugPreview} readOnly disabled />
            <p className="text-muted-foreground text-xs">
              {mode === "create"
                ? "제목에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                : "slug는 생성 후 변경할 수 없습니다."}
            </p>
          </FormItem>

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
        </section>

        {/* 설명 (en/ko × short/full) */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium">설명</h2>
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
        </section>

        {/* Platform links (5개 확정 키) */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium">플랫폼 링크</h2>
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
        </section>

        {/* Socials */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">소셜</h2>
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
          </div>
          {socials.fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              등록된 소셜이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {socials.fields.map((row, index) => (
                <div key={row.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`socials.${index}.platform`}
                    render={({ field }) => (
                      <FormItem className="w-40 shrink-0">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                    control={form.control}
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
                    control={form.control}
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
        </section>

        {/* 이미지 */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium">아트워크</h2>
          <ImageField
            label="아트워크 이미지"
            initialUrl={initialArtworkUrl}
            file={artworkFile}
            onFile={setArtworkFile}
          />
        </section>

        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "릴리즈 만들기"
                : "변경사항 저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${site}/releases`)}
          >
            취소
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}
