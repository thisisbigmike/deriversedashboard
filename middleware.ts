import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/api/auth",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/api/crypto"  // Allow public API access
    ];
    const isPublicRoute = publicRoutes.some((route) =>
        pathname === route || pathname.startsWith(route + "/") ||
        (route !== "/" && pathname.startsWith(route))
    );

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/settings", "/api/user", "/profile"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to login only for protected routes
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
