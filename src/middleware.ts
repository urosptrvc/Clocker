import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {verifyToken} from "@/lib/verifyJWT";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow access to authentication and API routes
    if (path.includes("/auth/") || path.startsWith("/api/")) {
        return NextResponse.next()
    }

    const clientTokenName = `${process.env.NEXT_PUBLIC_AUTH_TOKEN}` // Client token - User Session Token Name
    const sessionJwt = request.cookies.get(clientTokenName)?.value as string

    // If no JWT, redirect to login
    // if (!sessionJwt) {
    //     console.log("Missing session token - redirect to login")
    //     return NextResponse.redirect(new URL("/auth/login", request.url))
    // }

    // Check the expiration session and redirect if needed
    const session = await verifyToken(sessionJwt)
    if (!session) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url))
        response.cookies.delete(clientTokenName)
        return response
    }

    return NextResponse.next()
}
// Supports both a single string value or an array of matchers
export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    matcher: ["/((?!auth/*|404|401|403|fonts|_next/static|_next/image|favicon.ico|images/*).*)"],
}
