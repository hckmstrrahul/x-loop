import { NextResponse, type NextRequest } from 'next/server';

// Optional single-user gate.
//
// If BASIC_AUTH_USER and BASIC_AUTH_PASS are set in env, every request is
// challenged with HTTP Basic Auth. Skip these env vars and the gate is
// completely off — the app stays public.
//
// Use this if you want to deploy publicly on Vercel but keep the app for
// yourself. For purely local use you don't need this at all.
//
// Next.js 16: this file is named proxy.ts (formerly middleware.ts) and
// the exported function is `proxy`. Proxy always runs on Node.js — no
// runtime export, no edge config.

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.svg).*)'],
};

export function proxy(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return NextResponse.next();

  const header = req.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = '';
    }
    const idx = decoded.indexOf(':');
    if (idx > 0) {
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (timingSafeEqual(u, user) && timingSafeEqual(p, pass)) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="x-loop"' },
  });
}

// Constant-time string compare — prevents timing oracle on the password.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
