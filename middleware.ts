// PHASE 1: NextAuth middleware disabled temporarily
// This middleware will be re-enabled in Phase 3 after Prisma is fixed
// DISABLED FOR GITHUB PAGES: Middleware doesn't work with static export

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // DISABLED FOR STATIC EXPORT: Middleware is not supported in static export
  // For GitHub Pages, all routing is handled client-side
  return NextResponse.next()
  
  /* PHASE 3: Re-enable after Prisma is fixed
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // If accessing admin routes
  if (isAdminRoute) {
    // Allow /admin/login without authentication
    if (pathname === "/admin/login") {
      // If already authenticated as admin, redirect to admin dashboard
      if (token && token.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.next()
    }

    // Require authentication for other admin routes
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Require admin role
    if (token.role !== "admin") {
      // Non-admin trying to access admin area - redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // If accessing auth pages while authenticated
  if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
    // Redirect based on role
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protected user routes (dashboard, etc.)
  const protectedUserRoutes = ["/dashboard", "/gift-cards", "/orders", "/services"]
  const isProtectedUserRoute = protectedUserRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedUserRoute && !token) {
    // Not authenticated - allow access but UI will show login modal
    // Or redirect to login if you prefer
    return NextResponse.next()
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
