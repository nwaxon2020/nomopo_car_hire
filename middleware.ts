// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/firebaseAdmin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect driver-profile page
  if (pathname.startsWith("/driver-profile")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      // No token → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);

      // Optional: restrict to the correct driver only
      const pathParts = pathname.split("/");
      const driverIdFromUrl = pathParts[pathParts.length - 1];

      if (decodedToken.uid !== driverIdFromUrl) {
        // Logged-in driver does not match URL → redirect to login
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error("Middleware auth error:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Allow other paths
  return NextResponse.next();
}

export const config = {
  matcher: ["/driver-profile/:path*"],
};
