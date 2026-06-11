import { NextRequest, NextResponse } from "next/server";

// Password admin — cambiala qui se vuoi
const ADMIN_PWD = ["s","o","f","f","i","t","t","a","2","0","2","4"].join("");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteggi le rotte admin (non il login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value;
    if (token !== ADMIN_PWD) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Coming soon — cambia false in true per chiudere il sito
  if (false) {
    const adminToken = req.cookies.get("admin_token")?.value;
    const isAdmin = adminToken === ADMIN_PWD;
    const bypass = ["/admin", "/api", "/coming-soon", "/_next", "/favicon", "/privacy", "/termini", "/ordine", "/contatti", "/sitemap.xml", "/robots.txt", "/preferiti", "/offerte", "/bundle", "/offline", "/manifest.json", "/sw.js", "/icon-", "/recensisci", "/reso", "/punti"];
    if (!isAdmin && !bypass.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/coming-soon", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
