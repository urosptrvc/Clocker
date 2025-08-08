import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const protectedRoutes = [
        "/clocktime",
        "/history",
        // "/api/:path*"  <-- ovo sklanjamo
    ];

    const session = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = req.nextUrl;

    // Ako je korisnik već ulogovan i ide na login
    if (pathname === "/auth/login" && session) {
        return NextResponse.redirect(new URL("/clocktime", req.url));
    }

    // Provera samo za rute koje zahtevaju login
    if (
        protectedRoutes.some(route => pathname.startsWith(route)) ||
        pathname.match(/^\/clocktime\/\w+/)
        // pathname.match(/^\/api\/clock\/\w+/) <-- ovo sklanjamo
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
        // "/api/:path*" <-- više ne stavljamo API ovde
    ],
};
