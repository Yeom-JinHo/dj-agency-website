"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@repo/content/supabase/client";

import adminLogo from "@/assets/admin-logo.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginValues = z.infer<typeof loginSchema>;

/** 로그인 실패 토스트 둘은 수동 해제(duration: Infinity)라 저절로 사라지지 않는다.
 *  오타 재시도가 잦은 화면이라 같은 id로 덮어써 쌓이지 않게 하고, 상태가 해소되는
 *  지점(검증 통과·로그인 성공)에서 각각 거둔다. 안 거두면 대시보드까지 따라간다. */
const INVALID_TOAST = "login-invalid";
const FAILED_TOAST = "login-failed";

// 회원가입 UI 없음 — 편집자는 Supabase Auth 콘솔에서 초대한다(cms-plan §8).
export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    // zodResolver 대신 standardSchemaResolver — zod 4.4의 ~standard 인터페이스를 쓰므로
    // resolvers 5.4의 zod/v4/core 버전 브랜드 충돌을 피한다(P2 폼도 동일 패턴).
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /** 검증 실패 시 RHF가 첫 오류 필드에 포커스하지만, 폼 위쪽에서
   * "아무 일도 없는" 것처럼 보이지 않게 토스트로도 알린다(artist-form과 동일 패턴). */
  function onInvalid() {
    toast.error("입력값을 확인해주세요.", {
      id: INVALID_TOAST,
      duration: Infinity,
    });
  }

  async function onSubmit(values: LoginValues) {
    // 여기까지 왔다면 검증을 통과한 것이므로 이전 검증 실패 안내는 이미 낡았다.
    toast.dismiss(INVALID_TOAST);
    setSubmitting(true);
    // 브라우저 클라이언트는 제출 시점에만 생성 — 렌더/프리렌더에서 호출되지 않게 한다.
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setSubmitting(false);
      // 원문(계정 존재 여부 등 노출 가능)은 로그로만, 사용자에겐 고정 문구.
      console.error("[login] signIn failed:", error.message);
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.", {
        id: FAILED_TOAST,
        duration: Infinity,
      });
      return;
    }
    toast.dismiss(FAILED_TOAST);
    // 성공 시 pending 유지 — 네비게이션 완료 전에 버튼이 원래 라벨로
    // 돌아와 재클릭을 유발하는 죽은 시간을 없앤다.
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      {/* 유일한 비인증 화면이자 첫인상인데 그동안 흰 배경 위에 로고·제목·필드가 구획 없이
          떠 있었다. 카드 어휘는 ui/card.tsx와 같은 값(rounded-xl border bg-card shadow-sm)을
          쓴다 — 로그인만 다른 카드처럼 보이지 않게. --card는 --background와 같은 흰색이라
          경계는 border와 shadow-sm이 만든다(대시보드 드릴다운 카드와 동일한 방식).

          브랜드 신호는 상단 2px primary 헤어라인 하나만 얹었다. 배경 래디얼 그라디언트도
          후보였지만 6% 알파는 보일락 말락 해서 값을 치르고 신호는 못 얻는다. primary는 이
          앱의 유일한 유채색 토큰이라, 폭을 1px 늘린 선 하나가 오히려 의도로 읽힌다.
          border-primary가 아니라 border-t-primary인 것도 의도 — 전자는 네 변을 모두
          인디고로 칠한다. */}
      <div className="bg-card border-t-primary w-full max-w-sm space-y-6 rounded-xl border border-t-2 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          {/* 헤더 로고(20px·rounded-[4px])와 같은 어휘(ring+rounded)를 40px로 확대.
              반경은 같은 비율(4/20)을 유지해 8px — rounded-lg는 --radius(10px)라 비율이 어긋난다. */}
          <Image
            src={adminLogo}
            alt=""
            aria-hidden
            width={40}
            height={40}
            className="ring-border size-10 shrink-0 rounded-[8px] ring-1"
          />
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              ye0m2 admin
            </h1>
            <p className="text-muted-foreground text-sm">
              로그인 후 콘텐츠를 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            {/* 제출 중 전체 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다(폼 3종과 동일 패턴). */}
            <fieldset disabled={submitting} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        // 이메일(you@example.com)만 placeholder가 있어 두 필드의
                        // 시각 균형이 어긋났다 — 마스킹 관례 표기로 맞춘다.
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "로그인 중…" : "로그인"}
              </Button>
            </fieldset>
          </form>
        </Form>
      </div>
    </main>
  );
}
