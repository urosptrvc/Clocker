import { NextResponse } from "next/server"
import {getServerSession} from "next-auth";
import {prisma} from "@/lib/prisma";
import {authOptions} from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Nemate privilegiju" }, { status: 401 })
    }
    const userId = session.user.id
    const sessions = await prisma.clockSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            clockInEvent: true,
            clockOutEvent: true,
        },
    })

    const formatted = sessions.map((sess) => ({
        id: sess.id,
        clockIn: sess.clockInEvent.timestamp,
        clockOut: sess.clockOutEvent ? sess.clockOutEvent.timestamp : null,
        location: sess.clockInEvent.location || sess.clockOutEvent?.location || null,
        duration: sess.clockOutEvent
            ? Math.floor((sess.clockOutEvent.timestamp.getTime() - sess.clockInEvent.timestamp.getTime()) / 1000)
            : null,
        notes: null,
    }))

    return NextResponse.json(formatted)
}
