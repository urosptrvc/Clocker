import { NextResponse } from "next/server"
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
