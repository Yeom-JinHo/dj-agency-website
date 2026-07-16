"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@repo/content/supabase/client";

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
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

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

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    // 브라우저 클라이언트는 제출 시점에만 생성 — 렌더/프리렌더에서 호출되지 않게 한다.
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            v.f.labs Admin
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage content.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
