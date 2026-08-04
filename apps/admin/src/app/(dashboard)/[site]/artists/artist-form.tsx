"use client";

import { useId, useState } from "react";
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
import { FormSubmitButton } from "@/components/form-submit-button";
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
  Form,
  FormControl,
  FormDescription,
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
  const slugFieldId = useId();
  // "생성 후 변경할 수 없습니다"는 지금 입력을 되돌릴 수 없다는 규칙이라 필드에 묶어야
  // 낭독된다. RHF 필드가 아니라 FormDescription을 못 써 id를 직접 만든다(라벨과 같은 방식).
  const slugHintId = useId();

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    form,
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
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        aria-busy={submitting}
      >
        {/* max-w-4xl: 사이드바(16rem)+콘텐츠 패딩과 합쳐 1200px — 1366 노트북까지 들어가고
            사이드바 도입 전 값(2xl)이 남기던 우측 여백을 회수한다. 긴 텍스트의 measure는
            설명 카드의 2열 그리드가 잡는다(한 열 ≈55자). 스켈레톤도 같은 폭이어야 한다.
            액션 바까지 이 폭 안에 있어야 sticky 바의 border-t가 폼과 같은 너비로 그어진다. */}
        <div className="max-w-4xl min-w-0 space-y-6">
        {/* 제출 중 입력 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다. 저장·취소 버튼은
            fieldset 밖이다: disabled가 되는 순간 브라우저가 blur시켜 Enter로 저장한
            키보드 사용자가 탭 위치를 잃는다(FormSubmitButton 주석 참고). */}
        <fieldset disabled={submitting} className="min-w-0 space-y-6">
        {/* 섹션 제목 text-lg + 구분선 — 페이지 제목(text-2xl)과 필드 라벨(text-sm) 사이에
            한 단씩 벌려야 카드가 이어지는 폼에서 섹션 경계가 잡힌다(text-base는 라벨과
            한 단 차이뿐이었다). border-b는 CardHeader의 [.border-b]:pb-6 훅을 깨우는데,
            카드는 py-4 리듬이지만 pb-4로 덮으려면 !important가 필요하고(훅 선택자가 :is()로
            한 단 높다) 이 앱엔 그 선례가 없어 24px을 그대로 받아들인다. */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">기본 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* 필수 표시 — 별표는 시각 전용(aria-hidden), 의미는 aria-required가
                      전달한다(release-form.tsx 제목 필드와 같은 패턴). */}
                  <FormLabel>
                    이름
                    <span aria-hidden className="text-destructive -ml-1">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="아티스트 이름"
                      aria-required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* slug는 RHF 필드가 아니라 이름에서 파생되는 읽기 전용 표시라 FormItem/FormLabel을 쓰지 않는다 —
                FormLabel의 htmlFor는 FormControl이 부여하는 id를 가리키는데 여기엔 FormControl이 없어
                라벨이 존재하지 않는 id를 가리키고 있었다(스크린리더가 이름 없는 필드로 읽음).
                RHF 관여가 없으니 일반 Label + useId로 직접 연결한다. 마크업(grid gap-2)은 FormItem과 동일. */}
            <div className="grid gap-2">
              <Label htmlFor={slugFieldId}>Slug</Label>
              <Input
                id={slugFieldId}
                value={slugPreview}
                readOnly
                aria-describedby={slugHintId}
                className="bg-muted font-mono"
              />
              <p id={slugHintId} className="text-muted-foreground text-xs">
                {mode === "create"
                  ? "이름에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                  : "slug는 생성 후 변경할 수 없습니다."}
              </p>
            </div>

            {/* 닉네임·도시는 짧은 값인데 전체폭(≈1170px)을 차지해 폭이 값의 성격을
                말하지 못했다 — 릴리즈 폼의 레이블·카탈로그 번호와 같은 2열 그리드. */}
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬 순서</FormLabel>
                  <FormControl>
                    {/* 폭 제한은 입력에만 — FormItem에 걸면 아래 도움말까지 좁아져
                        "노/출됩니다"로 어색하게 개행됐다(release-form과 같은 처방). */}
                    <Input
                      type="number"
                      min={0}
                      className="w-32"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  {/* 생 <p> 대신 FormDescription — FormControl의 aria-describedby가
                      이 요소를 가리켜야 정렬 규칙이 필드와 함께 낭독된다.
                      text-xs는 기존 크기 유지용(기본값은 text-sm). */}
                  <FormDescription className="text-xs">
                    사이트 목록에서 오름차순으로 노출됩니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 설명 (en/ko × short/full) */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">설명</h2>
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
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">대표 작업</h2>
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
                {/* 컬럼 헤더 한 줄 — socials 카드와 같은 처방이다(이유는
                    socials-field-array.tsx 주석). 값이 채워지면 placeholder가
                    사라져 "MIX · 2025"가 제목인지 메타인지 화면에서 알 수 없었다.
                    두 번째 컬럼은 placeholder가 형식 예시("예: MIX · 2025")로 바뀌면서
                    필드 이름을 아예 말하지 않게 됐다 — 비어 있을 때조차 이 헤더가
                    유일한 이름이라 더 필요해졌다. "(선택)"은 헤더로 올리지 않는다:
                    선택 여부가 의미 있는 건 비어 있을 때뿐이고 그땐 placeholder가 보인다.
                    섹션 어휘는 "대표 작업"·"등록된 작업이 없습니다" 그대로라 라벨도
                    제거 버튼과 같은 "작업"을 쓴다(#306은 socials 쪽만 손봤다).
                    폭은 아래 행과 같은 값(flex-1 / flex-1 + 버튼 자리 size-9). */}
                <div
                  aria-hidden
                  className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
                >
                  <span className="flex-1">제목</span>
                  <span className="flex-1">메타</span>
                  <span className="size-9 shrink-0" />
                </div>
                {works.fields.map((row, index) => (
                  <div key={row.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`selectedWorks.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            {/* 행 번호는 스크린리더용 — "제목"만 세 번 읽히면 몇 번째
                                작업인지 알 수 없다. 어휘는 제거 버튼의 "작업"에 맞춘다. */}
                            <Input
                              placeholder="제목"
                              aria-label={`작업 ${index + 1} 제목`}
                              {...field}
                            />
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
                            {/* "메타(선택)"만으로는 형식을 알 수 없었다 — 기존
                                데이터가 따르는 표기(분류 · 연도)를 예시로 보인다. */}
                            <Input
                              placeholder="예: MIX · 2025 (선택)"
                              aria-label={`작업 ${index + 1} 메타`}
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
                      // 입력들이 행 번호로 불리는데 제거 버튼만 "작업 제거"면 어느
                      // 행이 사라지는지 모른 채 파괴적 동작을 누르게 된다.
                      aria-label={`작업 ${index + 1} 제거`}
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
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">이미지</h2>
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

        </fieldset>

        <FormActions>
          <FormSubmitButton busy={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "아티스트 만들기"
                : "변경사항 저장"}
          </FormSubmitButton>
          {/* 취소는 fieldset 밖으로 나왔지만 잠금은 유지 — 저장 왕복 중 이탈은 막아야
              한다. 포커스를 쥔 채 disabled가 되는 경로가 없어(취소 버튼은 제출을
              시작시키지 않는다) 저장 버튼과 달리 disabled를 그대로 쓴다. */}
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            취소
          </Button>
        </FormActions>
        </div>
      </form>
    </Form>
  );
}
