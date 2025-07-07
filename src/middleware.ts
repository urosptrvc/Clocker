import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const protectedRoutes = [
        "/clocktime",
        "/history",
        "/api/:path*",
    ];

    const session = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = req.nextUrl;

    if ((pathname === "/auth/login" && session) || (pathname === "/auth/register" && session)) {
        return NextResponse.redirect(new URL("/clocktime", req.url));
    }

    if (
        protectedRoutes.some(route => pathname.startsWith(route)) ||
        pathname.match(/^\/clocktime\/\w+/) ||
        pathname.match(/^\/api\/clock\/\w+/)
    ) {
        if (!session) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/clocktime/:path*",
        "/history/:path*",
        "/api/:path*",
    ],
};
