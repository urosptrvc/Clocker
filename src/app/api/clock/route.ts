import { NextResponse } from "next/server"
import {getServerSession} from "next-auth";
import {prisma} from "@/lib/prisma";
import {authOptions} from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Nemate privilegiju" }, { status: 401 })
    }

    const activeSession = await prisma.clockSession.findFirst({
        where: {
            userId: session.user.id,
            clockOutEventId: null,
        },
        include: {
            clockInEvent: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return NextResponse.json({ activeSession })
}
