import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req, evt) => {
  const publicRoutes = ["/", "/api/webhook/stripe", "/sign-in", "/sign-up", "/sso-callback"];
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // Add any other custom logic here if needed
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // This likely covers '/' already
    "/(api|trpc)(.*)", 
  ],
};
