import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value || 
                      request.cookies.get("__Secure-authjs.session-token")?.value;
  
  const isLoggedIn = !!sessionToken;
  const { pathname } = request.nextUrl;

  // Simple manual check based on the logic in auth.config.ts
  const isOnDashboard = pathname.startsWith('/dashboard');
  
  // Public routes
  const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/api/auth",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/api/crypto"
  ];
  
  const isPublicRoute = publicRoutes.some((route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  if (isOnDashboard) {
      if (isLoggedIn) return NextResponse.next();
      return NextResponse.redirect(new URL('/login', request.url));
  } else if (isLoggedIn) {
      if (pathname === '/login' || pathname === '/register') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
