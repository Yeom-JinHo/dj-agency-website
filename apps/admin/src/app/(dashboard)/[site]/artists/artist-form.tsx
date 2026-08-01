"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { SOCIAL_PLATFORMS, type SiteSlug } from "@repo/content/schema";

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
import { artistFormSchema, type ArtistFormValues } from "./schema";
import { createArtist, updateArtist } from "./actions";

interface ArtistFormProps {
  mode: "create" | "edit";
  /** 소속 사이트(라우트 [site] 세그먼트). 링크·리다이렉트·서버 액션에 전달. */
  site: SiteSlug;
  artistId?: string;
  /** edit 모드: 기존 slug(불변, 읽기 전용 표시). */
  slug?: string;
  defaultValues: ArtistFormValues;
  initialProfileUrl?: string | null;
  initialLogoUrl?: string | null;
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
            <span className="text-muted-foreground text-xs">이미지 없음</span>
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

export function ArtistForm({
  mode,
  site,
  artistId,
  slug,
  defaultValues,
  initialProfileUrl = null,
  initialLogoUrl = null,
}: ArtistFormProps) {
  const router = useRouter();
  const listHref = `/${site}/artists`;
  const [submitting, setSubmitting] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<ArtistFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(artistFormSchema),
    defaultValues,
  });

  const socials = useFieldArray({ control: form.control, name: "socials" });
  const works = useFieldArray({ control: form.control, name: "selectedWorks" });

  const nameValue = form.watch("name");
  const slugPreview = mode === "create" ? slugify(nameValue) : (slug ?? "");

  async function onSubmit(values: ArtistFormValues) {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("payload", JSON.stringify(values));
    if (profileFile) fd.set("profileImage", profileFile);
    if (logoFile) fd.set("logoImage", logoFile);

    const result =
      mode === "create"
        ? await createArtist(site, fd)
        : await updateArtist(site, artistId!, fd);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // 부분 성공(생성됐지만 이미지 저장 실패): 편집 화면으로 안내해 이어서 저장.
    if (result.warning && result.id) {
      toast.warning(result.warning);
      router.push(`${listHref}/${result.id}`);
      router.refresh();
      return;
    }
    toast.success(
      mode === "create"
        ? "아티스트를 만들었습니다."
        : "변경사항을 저장했습니다.",
    );
    router.push(listHref);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="아티스트 이름" {...field} />
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
                ? "이름에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                : "slug는 생성 후 변경할 수 없습니다."}
            </p>
          </FormItem>

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>도시</FormLabel>
                <FormControl>
                  <Input placeholder="서울" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem className="w-40">
                <FormLabel>정렬 순서</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  사이트 목록에서 오름차순으로 노출됩니다.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      <Textarea rows={name.startsWith("full") ? 5 : 2} {...field} />
                    </FormControl>
                    <FormMessage />
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

        {/* Selected works (celebrate roster) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">대표 작업</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => works.append({ title: "", meta: "" })}
            >
              <PlusIcon /> 추가
            </Button>
          </div>
          {works.fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              등록된 작업이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {works.fields.map((row, index) => (
                <div key={row.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`selectedWorks.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="제목" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`selectedWorks.${index}.meta`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="메타(선택)"
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
                    onClick={() => works.remove(index)}
                    aria-label="작업 제거"
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
          <h2 className="text-sm font-medium">이미지</h2>
          <ImageField
            label="프로필 이미지"
            initialUrl={initialProfileUrl}
            file={profileFile}
            onFile={setProfileFile}
          />
          <ImageField
            label="로고 이미지"
            initialUrl={initialLogoUrl}
            file={logoFile}
            onFile={setLogoFile}
          />
        </section>

        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "아티스트 만들기"
                : "변경사항 저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(listHref)}
          >
            취소
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}
