import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Create a response and pass it to the Supabase client
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if it exists
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      // If there's a session error, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If there's no session and trying to access protected routes
    if (
      !session &&
      (request.nextUrl.pathname.startsWith("/user/dashboard") ||
        request.nextUrl.pathname.startsWith("/admin"))
    ) {
      const redirectUrl = new URL("/login", request.url);
      // Add the original URL as ?from= param to redirect after login
      redirectUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If accessing admin routes, check if user is admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("is_admin")
        .eq("id", session?.user?.id)
        .single();

      if (accountError || !account?.is_admin) {
        // If not admin, redirect to user dashboard
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
    }

    // If there's a session and trying to access login/register
    if (
      session &&
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register")
    ) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    // Update response headers if needed
    return res;
  } catch (e) {
    console.error("Middleware error:", e);
    // For any errors, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
