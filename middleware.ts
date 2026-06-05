import { NextRequest, NextResponse } from "next/server";

const COMING_SOON = process.env.COMING_SOON === "true";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteggi le rotte admin (non il login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value;
    if (token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Coming soon — reindirizza tutto tranne admin, api e coming-soon
  if (COMING_SOON) {
    const bypass = ["/admin", "/api", "/coming-soon", "/_next", "/favicon"];
    if (!bypass.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/coming-soon", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
