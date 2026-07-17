"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  SITE_SLUGS,
  SOCIAL_PLATFORMS,
  type SiteSlug,
} from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  artistFormSchema,
  type ArtistFormValues,
} from "./schema";
import { createArtist, updateArtist } from "./actions";

/** 사이트 노출 체크박스 라벨(단일 사용 — 표시 전용). */
const SITE_LABELS: Record<SiteSlug, string> = {
  "vague-frequency-labs": "Vague Frequency Labs",
  "payday-records": "Payday Records",
  "celebrate-agency": "Celebrate Agency",
  juntaro: "Juntaro",
};

interface ArtistFormProps {
  mode: "create" | "edit";
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

export function ArtistForm({
  mode,
  artistId,
  slug,
  defaultValues,
  initialProfileUrl = null,
  initialLogoUrl = null,
}: ArtistFormProps) {
  const router = useRouter();
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
  const sites = form.watch("sites");

  const nameValue = form.watch("name");
  const slugPreview = mode === "create" ? slugify(nameValue) : (slug ?? "");

  function isSiteEnabled(siteSlug: SiteSlug): boolean {
    return sites.some((s) => s.siteSlug === siteSlug);
  }
  function siteSortOrder(siteSlug: SiteSlug): number {
    return sites.find((s) => s.siteSlug === siteSlug)?.sortOrder ?? 0;
  }
  function toggleSite(siteSlug: SiteSlug, checked: boolean) {
    const current = form.getValues("sites");
    const next = checked
      ? [...current, { siteSlug, sortOrder: 0 }]
      : current.filter((s) => s.siteSlug !== siteSlug);
    form.setValue("sites", next, { shouldDirty: true });
  }
  function setSortOrder(siteSlug: SiteSlug, sortOrder: number) {
    const next = form
      .getValues("sites")
      .map((s) => (s.siteSlug === siteSlug ? { ...s, sortOrder } : s));
    form.setValue("sites", next, { shouldDirty: true });
  }

  async function onSubmit(values: ArtistFormValues) {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("payload", JSON.stringify(values));
    if (profileFile) fd.set("profileImage", profileFile);
    if (logoFile) fd.set("logoImage", logoFile);

    const result =
      mode === "create"
        ? await createArtist(fd)
        : await updateArtist(artistId!, fd);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      mode === "create"
        ? "아티스트를 만들었습니다."
        : "변경사항을 저장했습니다.",
    );
    router.push("/artists");
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Artist name" {...field} />
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
                <FormLabel>Nickname</FormLabel>
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
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Seoul" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* 설명 (en/ko × short/full) */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium">Descriptions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["shortDescriptionEn", "Short (EN)"],
                ["shortDescriptionKo", "Short (KO)"],
                ["fullDescriptionEn", "Full (EN)"],
                ["fullDescriptionKo", "Full (KO)"],
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
            <h2 className="text-sm font-medium">Socials</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                socials.append({ platform: "instagram", url: "", label: "" })
              }
            >
              <PlusIcon /> Add
            </Button>
          </div>
          {socials.fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">No socials.</p>
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
                              <SelectValue placeholder="Platform" />
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
                            placeholder="Label"
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
                    aria-label="Remove social"
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
            <h2 className="text-sm font-medium">Selected works</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => works.append({ title: "", meta: "" })}
            >
              <PlusIcon /> Add
            </Button>
          </div>
          {works.fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">No works.</p>
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
                          <Input placeholder="Title" {...field} />
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
                            placeholder="Meta (optional)"
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
                    aria-label="Remove work"
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
          <h2 className="text-sm font-medium">Images</h2>
          <ImageField
            label="Profile image"
            initialUrl={initialProfileUrl}
            file={profileFile}
            onFile={setProfileFile}
          />
          <ImageField
            label="Logo image"
            initialUrl={initialLogoUrl}
            file={logoFile}
            onFile={setLogoFile}
          />
        </section>

        {/* 사이트 노출 */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Site exposure</h2>
          <div className="space-y-2">
            {SITE_SLUGS.map((siteSlug) => {
              const enabled = isSiteEnabled(siteSlug);
              return (
                <div key={siteSlug} className="flex items-center gap-3">
                  <Checkbox
                    id={`site-${siteSlug}`}
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      toggleSite(siteSlug, checked === true)
                    }
                  />
                  <Label htmlFor={`site-${siteSlug}`} className="w-48">
                    {SITE_LABELS[siteSlug]}
                  </Label>
                  {enabled ? (
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`sort-${siteSlug}`}
                        className="text-muted-foreground text-xs"
                      >
                        Sort order
                      </Label>
                      <Input
                        id={`sort-${siteSlug}`}
                        type="number"
                        min={0}
                        value={siteSortOrder(siteSlug)}
                        onChange={(e) =>
                          setSortOrder(siteSlug, Number(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create artist"
                : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/artists")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
