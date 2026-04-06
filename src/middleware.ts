import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REF_COOKIE = {
  maxAge: 60 * 60 * 24 * 90,
  path: "/",
  sameSite: "lax" as const,
};

/** Cookie switch_ref: ?ref= no cadastro ou /ref/CODIGO (Google OAuth lê em auth.ts). */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/ref/")) {
    const seg = pathname.slice(5);
    const clean = seg.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    const url = request.nextUrl.clone();
    url.pathname = "/cadastro";
    const res = NextResponse.redirect(url);
    if (clean) {
      res.cookies.set("switch_ref", clean, REF_COOKIE);
    }
    return res;
  }

  if (pathname === "/cadastro") {
    const ref = searchParams.get("ref");
    if (ref) {
      const clean = ref.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
      const res = NextResponse.next();
      if (clean) {
        res.cookies.set("switch_ref", clean, REF_COOKIE);
      }
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cadastro", "/ref/:path*"],
};
