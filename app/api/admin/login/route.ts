import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const ADMIN_PWD = ["s","o","f","f","i","t","t","a","2","0","2","4"].join("");

  if (password !== ADMIN_PWD) {
    return NextResponse.json({ error: "Password errata" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", ADMIN_PWD, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
    path: "/",
  });
  return res;
}
