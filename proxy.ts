import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "poker-tracking-super-secret-key-123456";
const key = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the poker_session cookie
  const token = request.cookies.get("poker_session")?.value;

  // Define public paths
  const isLoginPage = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") || 
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/vercel.svg") ||
    pathname.startsWith("/next.svg");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // If no token, redirect to /login
  if (!token) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Verify token
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;

    // If logged in and trying to access login, redirect to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin routes protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Default redirect from '/' to '/dashboard'
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    // If token invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("poker_session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
