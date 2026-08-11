"use client";

import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { hasRosterProfileFields } from "@/lib/sites";
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
  /** edit 모드: 로드 시점의 updated_at — 서버 액션의 동시 편집 충돌 검사에 쓴다. */
  updatedAt?: string;
  defaultValues: ArtistFormValues;
  initialProfileUrl?: string | null;
}

export function ArtistForm({
  mode,
  site,
  artistId,
  slug,
  updatedAt,
  defaultValues,
  initialProfileUrl = null,
}: ArtistFormProps) {
  const listHref = `/${site}/artists`;
  const [profile, setProfile] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);

  const form = useForm<ArtistFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(artistFormSchema),
    defaultValues,
  });

  const works = useFieldArray({ control: form.control, name: "selectedWorks" });

  /** 도시·대표 작업은 로스터를 쓰는 사이트에서만(lib/sites.ts 주석에 근거). */
  const showRosterFields = hasRosterProfileFields(site);

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
    hasUnsaved: form.formState.isDirty || isImageFieldDirty(profile),
    // 로스터 필드를 감춘 사이트에선 서버의 city·selectedWorks 오류를 붙일 자리가
    // 없다 — 릴리즈·투어 폼과 같은 처방(useEntityFormSubmit hiddenFields 주석).
    hiddenFields: showRosterFields
      ? undefined
      : (["city", "selectedWorks"] as const),
    buildFormData: (values: ArtistFormValues) => {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(values));
      if (profile.file) fd.set("profileImage", profile.file);
      if (profile.removed) fd.set("removeProfileImage", "1");
      // 로드 시점 updated_at — 그사이 다른 곳에서 저장됐으면 서버가 충돌로 끊는다.
      if (updatedAt) fd.set("expectedUpdatedAt", updatedAt);
      return fd;
    },
    create: (fd) => createArtist(site, fd),
    update: (fd) => updateArtist(site, artistId!, fd),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* 폭(max-w-4xl)은 페이지가 소유한다 — 폼이 자기 안에서 접으면 같은 페이지의
            헤더(브레드크럼·제목·삭제 버튼)가 전폭으로 남아 우측 기준선이 갈라진다
            (1440에서 240px, 1920에서 720px — 뷰포트 폭에 1:1 비례). 여기선 min-w-0만
            책임진다. 액션 바가 이 div 안에 있어야 sticky 바의 border-t가 폼과 같은
            너비로 그어지는 계약은 그대로다 — div째로 페이지 폭 안에 들어갈 뿐이다. */}
        <div className="min-w-0 space-y-6">
        {/* 제출 중 입력 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다. 저장·취소 버튼은
            fieldset 밖이다: disabled가 되는 순간 브라우저가 blur시켜 Enter로 저장한
            키보드 사용자가 탭 위치를 잃는다(FormSubmitButton 주석 참고).

            aria-busy도 form이 아니라 여기에 둔다 — form에 걸면 FormSubmitButton의
            진행 안내 라이브 리전이 busy 컨테이너의 자손이 되어, ARIA 규칙상 갱신이
            busy 해제까지 보류되고 그 시점의 내용은 빈 문자열이라 끝내 아무것도
            발화되지 않는다(WCAG 4.1.3). 액션 바가 fieldset 밖이라 한 단만 내리면
            리전이 busy 경계를 벗어난다. */}
        <fieldset
          disabled={submitting}
          aria-busy={submitting}
          className="min-w-0 space-y-6"
        >
        {/* 섹션 제목 text-lg + font-medium + 구분선 — 페이지 제목(text-xl)과 필드 라벨(text-sm) 사이에
            한 단씩 벌려야 카드가 이어지는 폼에서 섹션 경계가 잡힌다(text-base는 라벨과
            한 단 차이뿐이었다).
            크기만으로는 h1과 2px 차이뿐이라 두께를 함께 내린다(600→500). 색을 muted로
            내리는 안은 실화면에서 기각됐다 — 대비가 15.3:1에서 4.7:1로 떨어지면서
            바로 아래 필드 라벨(foreground)보다 제목이 물러나 보였다.
            border-b는 CardHeader의 [.border-b]:pb-6 훅을 깨우는데,
            카드는 py-4 리듬이지만 pb-4로 덮으려면 !important가 필요하고(훅 선택자가 :is()로
            한 단 높다) 이 앱엔 그 선례가 없어 24px을 그대로 받아들인다. */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-medium">기본 정보</h2>
          </CardHeader>
          {/* 이미지는 기본 정보의 우측 컬럼에 세운다(세 폼 공통 규약).
              종전엔 이미지가 마지막 카드라 문서의 78% 지점이었다 — 편집자가 이
              화면을 여는 첫 목적("지금 누구를 편집 중인가")을 풀려면 폼 끝까지
              스크롤해야 했다.

              좌측이 아니라 우측인 이유: DOM 순서가 곧 탭·낭독 순서라 좌측이면
              유일한 필수 필드(이름)보다 이미지 컨트롤 셋(원본 링크·교체·제거)이
              먼저 온다. CSS order로 시각 순서만 뒤집으면 WCAG 1.3.2·2.4.3 위반이다.
              우측이면 시각·DOM·탭 순서가 트릭 없이 일치한다.

              트랙 13rem(208px)은 ImageField의 미리보기 박스와 같은 값이다
              (PREVIEW_PX 주석). 고정폭이라 이미지 유무로 컬럼이 흔들리지 않는다. */}
          <CardContent className="grid grid-cols-[1fr_13rem] items-start gap-6">
            <div className="min-w-0 space-y-4">
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

            {/* 닉네임·도시는 짧은 값인데 전체폭을 차지해 폭이 값의 성격을 말하지
                못했다 — 릴리즈 폼의 레이블·발매일과 같은 2열 그리드. 도시를 감추는
                사이트에서는 닉네임만 남으므로 2열을 풀어 짝 없는 칸을 만들지 않는다. */}
            <div
              className={
                showRosterFields ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"
              }
            >
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

              {showRosterFields ? (
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
              ) : null}
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
            </div>

            <ImageField
              label="프로필 이미지"
              initialUrl={initialProfileUrl}
              value={profile}
              onChange={setProfile}
            />
          </CardContent>
        </Card>

        {/* 설명 (en/ko × short/full) */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-medium">설명</h2>
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

        {/* 대표 작업은 로스터를 쓰는 사이트에서만 — 다른 사이트에선 저장해도 공개
            화면이 읽지 않는데 카드·"추가" 버튼·탭 스톱만 남았고, "등록된 작업이
            없습니다"가 *아직 안 채운 것*으로 오독됐다(lib/sites.ts 주석). */}
        {showRosterFields ? (
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-medium">대표 작업</h2>
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
        ) : null}

        {/* 로고 이미지는 admin에서 수정·삭제하지 않기로 해 필드를 노출하지 않는다 —
            기존 logo_image_path 값은 그대로 보존되고 사이트에도 계속 표시된다. */}

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
