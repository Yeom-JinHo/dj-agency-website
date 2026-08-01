import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 전체 라우트 인증 가드. @supabase/ssr 미들웨어 패턴으로 세션 쿠키를 갱신하고,
 * 미로그인 사용자는 /login으로 리다이렉트한다. (/api/*, 정적 자원은 매처에서 제외 —
 * keepalive cron은 anon으로 인증 없이 도달해야 한다.)
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser()는 매 요청마다 Auth 서버에 토큰을 검증한다(getSession과 달리 위조 불가).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // _next 정적 자원과 keepalive cron(anon, 인증 없이 도달)만 가드에서 제외한다.
  // 새로 추가되는 /api 라우트는 매처에 자동 포함되어 기본 가드된다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/keepalive).*)"],
};
