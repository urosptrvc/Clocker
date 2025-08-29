import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/verifyJWT";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // ✅ Allow access to authentication and API routes
    if (path.includes("/auth/") || path.startsWith("/api/")) {
        return NextResponse.next()
    }

    const clientTokenName = `${process.env.NEXT_PUBLIC_AUTH_TOKEN}` // Client token - User Session Token Name
    const sessionJwt = request.cookies.get(clientTokenName)?.value as string

    // ✅ If no JWT, redirect to login
    if (!sessionJwt) {
        console.log("Missing session token - redirect to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // ✅ Verify token
    const session = await verifyToken(sessionJwt)
    if (!session) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url))
        response.cookies.delete(clientTokenName)
        return response
    }

    // 🔒 Restrict /admin only to role=admin
    if (path.startsWith("/admin") && session.role !== "admin") {
        return NextResponse.redirect(new URL("/403", request.url))
    }

    // ❌ Custom 404 – primer za blokirane ili nepostojeće rute
    // Ako želiš da eksplicitno hvataš određene "fake" putanje:
    if (path.startsWith("/secret") || path.startsWith("/hidden")) {
        return NextResponse.redirect(new URL("/404", request.url))
    }

    return NextResponse.next()
}

// Supports both a single string value or an array of matchers
export const config = {
    matcher: [
        "/((?!auth/*|404|401|403|fonts|_next/static|_next/image|favicon.ico|logo.png|images/*).*)"
    ],
}