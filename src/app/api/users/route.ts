import {NextResponse} from "next/server"
import {prisma} from "@/lib/prisma";
import {ValidateApiToken} from "@/lib/validateApiToken";

export async function GET() {
    const userSession = await ValidateApiToken()
    if(userSession.role !== "admin"){
        return NextResponse.json(
            { error: "Nemate pristup" },
            { status: 403 }
        )
    }
    try {
        const users = await prisma.user.findMany({
            include: {
                clockAttempts: true,
                clockSessions: true,
            },
            where: {
                isActive: "1"
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Greška prilikom dohvatanja korisnika:", error)
        return new NextResponse("Greška na serveru", {status: 500})
    }
}
