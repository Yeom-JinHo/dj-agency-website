"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { PLATFORM_LINK_KEYS, type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { hasSiteCategory } from "@/lib/sites";
import { useEntityFormSubmit } from "@/lib/use-entity-form-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
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
  /** edit 모드: 로드 시점의 updated_at — 서버 액션의 동시 편집 충돌 검사에 쓴다. */
  updatedAt?: string;
  defaultValues: ReleaseFormValues;
  /** primary artist select 옵션(같은 사이트 소속 로스터). 아티스트 미노출 사이트에선 빈 배열. */
  artists: { id: string; name: string }[];
  initialArtworkUrl?: string | null;
}

export function ReleaseForm({
  mode,
  site,
  releaseId,
  slug,
  updatedAt,
  defaultValues,
  artists,
  initialArtworkUrl = null,
}: ReleaseFormProps) {
  const listHref = `/${site}/releases`;
  const [artwork, setArtwork] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);

  /**
   * 로스터 셀렉트는 아티스트를 노출하는 사이트에서만 낸다(SITE_CATEGORY_SEGMENTS).
   * 아티스트 화면이 없는 사이트(payday·juntaro)에서 이 셀렉트만 남으면 "고를 수는 있는데
   * 이름을 고치거나 새로 만들 화면은 없는" 막다른 필드가 된다. 그 사이트들은 공개 앱도
   * artistCredit만 읽으므로(payday sections/release/data.ts, juntaro app/music/page.tsx)
   * 아래 "아티스트 크레딧" 자유 입력이 그대로 대체한다.
   *
   * 필드를 폼 값에서 빼지 않고 **렌더만** 막는다 — formValuesToDbInput이
   * `primary_artist_id: values.primaryArtistId || null`로 매핑하므로, 값을 지우면
   * 기존에 연결돼 있던 FK가 저장할 때마다 null로 날아간다. defaultValues는 기존 행에서
   * 오고 RHF는 렌더되지 않은 값도 그대로 들고 있어, 감춰도 저장 시 원래 id가 보존된다.
   */
  const showArtistSelect = hasSiteCategory(site, "artists");

  const form = useForm<ReleaseFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(releaseFormSchema),
    defaultValues,
  });

  const titleValue = form.watch("title");
  const slugPreview = mode === "create" ? slugify(titleValue) : (slug ?? "");
  const slugFieldId = useId();
  // "생성 후 변경할 수 없습니다"는 지금 입력을 되돌릴 수 없다는 규칙이라 필드에 묶어야
  // 낭독된다. RHF 필드가 아니라 FormDescription을 못 써 id를 직접 만든다(라벨과 같은 방식).
  const slugHintId = useId();

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    form,
    mode,
    listHref,
    createdMessage: "릴리즈를 만들었습니다.",
    // 파일 선택·제거는 RHF 밖 상태라 isDirty에 안 잡힌다 — 함께 미저장으로 취급.
    hasUnsaved: form.formState.isDirty || isImageFieldDirty(artwork),
    // 셀렉트를 감춘 사이트에선 서버의 primaryArtistId 오류(assertArtistInSite)를 붙일
    // 자리가 없다 — 토스트로 받게 넘긴다(useEntityFormSubmit hiddenFields 주석).
    hiddenFields: showArtistSelect ? undefined : (["primaryArtistId"] as const),
    buildFormData: (values: ReleaseFormValues) => {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(values));
      if (artwork.file) fd.set("artworkImage", artwork.file);
      if (artwork.removed) fd.set("removeArtworkImage", "1");
      // 로드 시점 updated_at — 그사이 다른 곳에서 저장됐으면 서버가 충돌로 끊는다.
      if (updatedAt) fd.set("expectedUpdatedAt", updatedAt);
      return fd;
    },
    create: (fd) => createRelease(site, fd),
    update: (fd) => updateRelease(site, releaseId!, fd),
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
          <CardContent className="space-y-4">
            {/* 아트워크가 이 카드의 첫 필드다 — 릴리즈의 1차 식별자는 커버아트인데
                별도 카드로 맨 아래(5번째)에 있어 스크롤 끝까지 가야 보였다.
                카드를 없애고 기본 정보로 들여오면 카드 수도 5→4로 줄어든다.
                라벨이 "아트워크 이미지"에서 "아트워크"로 짧아진 이유: 카드 제목이
                사라져 이 라벨이 유일한 이름인데, 이미지 필드에서 "이미지"는 잉여어다. */}
            <ImageField
              label="아트워크"
              // 폼 첫 필드라 sm — md(208px)면 바로 아래 제목이 접힘 밖으로 밀린다.
              previewSize="sm"
              initialUrl={initialArtworkUrl}
              value={artwork}
              onChange={setArtwork}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  {/* 필수 표시 — 없으면 제출 후 서버·스키마 에러로만 알 수 있다.
                      별표는 장식이 아니라 시각 전용 관례라 aria-hidden으로 숨기고,
                      의미는 input의 aria-required가 전달한다(3개 폼 공통 패턴). */}
                  <FormLabel>
                    제목
                    <span aria-hidden className="text-destructive -ml-1">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="릴리즈 제목" aria-required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* create에서만 입력 칸 형태다 — 제목을 치는 동안 값이 따라 바뀌는 걸
                보여줘야 "이 제목이면 이 주소"를 저장 전에 판단할 수 있다.
                RHF 필드가 아니라 FormItem/FormLabel을 쓰지 않는다: FormLabel의 htmlFor는
                FormControl이 부여하는 id를 가리키는데 여기엔 FormControl이 없어 라벨이
                존재하지 않는 id를 가리키게 된다(스크린리더가 이름 없는 필드로 읽음).
                일반 Label + useId로 직접 연결한다. 마크업(grid gap-2)은 FormItem과 동일.

                edit에서는 값이 이미 확정돼 다시는 바뀌지 않는다 — 입력 칸으로 두면
                제목 바로 아래에서 full-width로 제목만큼 시선을 먹으면서 정작 손댈 수는
                없다. 읽기용 메타 한 줄로 내린다(라벨·안내문도 그 줄에 흡수). */}
            {mode === "create" ? (
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
                  제목에서 자동 생성됩니다. 생성 후 변경할 수 없습니다.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Slug <span className="font-mono">{slugPreview}</span> · 생성 후
                변경할 수 없습니다.
              </p>
            )}

            {showArtistSelect && (
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
                    {/* 생 <p> 대신 FormDescription — FormControl의 aria-describedby가
                        이 요소를 가리켜야 "로스터 밖은 크레딧" 같은 입력 규칙이 필드와
                        함께 낭독된다. text-xs는 기존 크기 유지용(기본값은 text-sm). */}
                    <FormDescription className="text-xs">
                      이 사이트 소속 로스터의 아티스트. 로스터 밖 표기는 아티스트
                      크레딧을 사용하세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="artistCredit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아티스트 크레딧</FormLabel>
                  <FormControl>
                    <Input placeholder="예: Sam Collins" {...field} />
                  </FormControl>
                  {/* 로스터 셀렉트가 없는 사이트에선 "로스터 밖"이라는 대비가 성립하지
                      않는다(비교 대상이 화면에 없다) — 이 필드가 아티스트 표기의
                      유일한 수단임을 그대로 말한다. */}
                  <FormDescription className="text-xs">
                    {showArtistSelect
                      ? "로스터에 없는 외부 아티스트 표시용 자유 텍스트."
                      : "사이트에 표시되는 아티스트명."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 피처링 아티스트(featuredArtists)·카탈로그 번호(catalogNo)는 어떤
                사이트도 렌더하지 않아 필드를 노출하지 않는다 — 소비처가 생기면
                되살린다. 폼 값에는 남아 있어 기존 저장값은 그대로 보존된다.
                레이블은 짧은 값이라 반폭 처방(닉네임·도시)을 그대로 두되, 같은
                행에 발매일을 세워 2열을 채운다 — 필드 하나만 든 2열 그리드는
                오른쪽 절반이 비어 "필드가 하나 빠졌다"로 읽혔다. */}
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
            </div>

            {/* 정렬 순서는 그리드 밖 단독 행이다 — 짝을 지을 필드가 남지 않은
                상태에서 2열에 넣으면 다시 반쪽 빈칸이 생긴다. 그리드가 없으면
                w-32는 "빈 셀의 왼쪽에 몰린 입력"이 아니라 그냥 짧은 입력으로 읽힌다. */}
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬 순서</FormLabel>
                  <FormControl>
                    {/* 빈 칸이 즉시 0으로 덮이면 "10"을 "2"로 고치려 지우는 순간
                        칸에 0이 들어차 그 위에 타이핑한 값이 "02"가 된다
                        (Number("") || 0). 빈 칸은 빈 채로 두고 숫자일 때만 RHF에
                        흘린 뒤, 칸을 벗어날 때 0으로 정규화한다.
                        비제어(defaultValue)인 이유: sortOrder는 number라 제어
                        상태로는 빈 문자열을 담을 수 없고, 이 폼은 성공 시 화면을
                        떠나므로 reset()으로 값을 되돌리는 경로가 없다. */}
                    <Input
                      type="number"
                      min={0}
                      className="w-32"
                      name={field.name}
                      ref={field.ref}
                      defaultValue={field.value}
                      onChange={(e) => {
                        if (e.target.value !== "") {
                          field.onChange(Number(e.target.value));
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          e.target.value = "0";
                          field.onChange(0);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    사이트 내 노출 순서(작을수록 먼저).
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

        {/* 링크 — "플랫폼 링크"와 "소셜"이 별개 카드로 나란히 서 있었는데, 5개
            확정 키(beatport·spotify·appleMusic·soundcloud·youtubeMusic)가
            SOCIAL_PLATFORMS에도 전부 존재해 편집자는 Spotify 링크를 어느 카드에
            넣어야 하는지 알 수 없었다(양쪽에 넣으면 사이트에 두 번 나온다).
            한 카드 안의 두 블록으로 합치고, 앞 블록을 "발매 플랫폼"으로 불러
            "이 릴리즈를 들을 수 있는 곳"과 "계정 링크"의 역할 차이를 이름으로
            드러낸다. 스키마는 그대로다 — platform_links와 socials는 여전히 별개 컬럼. */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-medium">링크</h2>
          </CardHeader>
          {/* 블록 사이는 space-y-6 — 필드 간격(space-y-4)보다 한 단 넓어야 두 블록이
              한 카드 안에서도 서로 다른 묶음으로 읽힌다. */}
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {/* SocialsFieldArray의 block variant와 같은 아이브로 처방 —
                  두 블록 제목이 한 카드 안에 있어 어휘가 갈리면 안 된다. */}
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide">
                발매 플랫폼
              </h3>
              {/* 세로 라벨 2열 — 이 카드만 가로 라벨(w-28 좌측 열)이라 기본 정보·설명
                  카드와 폼 문법이 갈렸다. 설명 카드와 같은 2열 그리드로 통일한다. */}
              <div className="grid gap-4 sm:grid-cols-2">
                {PLATFORM_LINK_KEYS.map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`platformLinks.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{PLATFORM_LABELS[key]}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <SocialsFieldArray variant="block" />
          </CardContent>
        </Card>

        </fieldset>

        <FormActions>
          <FormSubmitButton busy={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "릴리즈 만들기"
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
