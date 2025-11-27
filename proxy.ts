import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes (routes that require authentication)
const isPublicRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, request) => {
  // Only protect routes that are explicitly marked as protected
  // The root route "/" is NOT in this list, so it remains public
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  // All other routes (including / and /api) are accessible without auth
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
