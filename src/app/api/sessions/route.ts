import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    const hourlyRate = user.hourly_rate ?? 0

    const formatted = sessions.map((sess) => {
        const duration = sess.durationMinutes ?? (
            sess.clockOutEvent
                ? Math.floor((sess.clockOutEvent.timestamp.getTime() - sess.clockInEvent.timestamp.getTime()) / 60000)
                : null
        )

        const regular = sess.regularMinutes ?? Math.min(600, duration ?? 0)
        const overtime = sess.overtimeMinutes ?? Math.max(0, (duration ?? 0) - 600)

        if(session?.user?.role == "admin"){
            return {
                id: sess.id,
                clockIn: sess.clockInEvent.timestamp,
                clockOut: sess.clockOutEvent?.timestamp ?? null,
                locationIn: sess.clockInEvent.location || null,
                locationOut: sess.clockOutEvent?.location || null,
                notesIn: sess.clockInEvent?.notes || null,
                notesOut: sess.clockOutEvent?.notes || null,
                durationMinutes: duration,
                regularMinutes: regular,
                overtimeMinutes: overtime,
                hourly_rate: hourlyRate,
                earningsRegular: +(regular / 60 * Number(hourlyRate)).toFixed(2),
                earningsOvertime: +((overtime / 60) * Number(hourlyRate) * 1.5).toFixed(2),
            }
        }
        else {
            return {
                id: sess.id,
                clockIn: sess.clockInEvent.timestamp,
                clockOut: sess.clockOutEvent?.timestamp ?? null,
                locationIn: sess.clockInEvent.location || null,
                locationOut: sess.clockOutEvent?.location || null,
                notesIn: sess.clockInEvent?.notes || null,
                notesOut: sess.clockOutEvent?.notes || null,
                durationMinutes: duration,
                regularMinutes: regular,
                overtimeMinutes: overtime,
            }
        }

    })

    return NextResponse.json(formatted)
}
