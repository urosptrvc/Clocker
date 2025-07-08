import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Nemate privilegiju" }, { status: 401 })
    }
    try {
        const users = await prisma.user.findMany({
            include: {
                clockAttempts: true,
                clockSessions: true,
            },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Greška prilikom dohvatanja korisnika:", error)
        return new NextResponse("Greška na serveru", { status: 500 })
    }
}
