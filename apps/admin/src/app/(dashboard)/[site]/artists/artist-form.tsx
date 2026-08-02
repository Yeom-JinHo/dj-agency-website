"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { useEntityFormSubmit } from "@/lib/use-entity-form-submit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { FormActions } from "@/components/form-actions";
import { SocialsFieldArray } from "@/components/socials-field-array";
import {
  EMPTY_IMAGE_FIELD,
  ImageField,
  isImageFieldDirty,
  type ImageFieldValue,
} from "@/components/image-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function ArtistForm({
  mode,
  site,
  artistId,
  slug,
  defaultValues,
  initialProfileUrl = null,
  initialLogoUrl = null,
}: ArtistFormProps) {
  const listHref = `/${site}/artists`;
  const [profile, setProfile] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);
  const [logo, setLogo] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);

  const form = useForm<ArtistFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(artistFormSchema),
    defaultValues,
  });

  const works = useFieldArray({ control: form.control, name: "selectedWorks" });

  const nameValue = form.watch("name");
  const slugPreview = mode === "create" ? slugify(nameValue) : (slug ?? "");

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    mode,
    listHref,
    createdMessage: "아티스트를 만들었습니다.",
    // 파일 선택·제거는 RHF 밖 상태라 isDirty에 안 잡힌다 — 함께 미저장으로 취급.
    hasUnsaved:
      form.formState.isDirty ||
      isImageFieldDirty(profile) ||
      isImageFieldDirty(logo),
    buildFormData: (values: ArtistFormValues) => {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(values));
      if (profile.file) fd.set("profileImage", profile.file);
      if (profile.removed) fd.set("removeProfileImage", "1");
      if (logo.file) fd.set("logoImage", logo.file);
      if (logo.removed) fd.set("removeLogoImage", "1");
      return fd;
    },
    create: (fd) => createArtist(site, fd),
    update: (fd) => updateArtist(site, artistId!, fd),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* 제출 중 전체 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다. */}
        <fieldset disabled={submitting} className="max-w-2xl min-w-0 space-y-6">
        {/* 기본 정보 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">기본 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Input value={slugPreview} readOnly disabled className="font-mono" />
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
          </CardContent>
        </Card>

        {/* 설명 (en/ko × short/full) */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">설명</h2>
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
                        <Textarea rows={name.startsWith("full") ? 5 : 2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <SocialsFieldArray />

        {/* Selected works (celebrate roster) */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">대표 작업</h2>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => works.append({ title: "", meta: "" })}
              >
                <PlusIcon /> 추가
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        {/* 이미지 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">이미지</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageField
              label="프로필 이미지"
              initialUrl={initialProfileUrl}
              value={profile}
              onChange={setProfile}
            />
            <ImageField
              label="로고 이미지"
              initialUrl={initialLogoUrl}
              value={logo}
              onChange={setLogo}
            />
          </CardContent>
        </Card>

        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "아티스트 만들기"
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
