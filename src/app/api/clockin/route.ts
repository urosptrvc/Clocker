import { NextResponse } from "next/server"
import { ClockType } from "@prisma/client"
import {getServerSession} from "next-auth";
import {prisma} from "@/lib/prisma";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const body = await req.json()
    const {location} = body

    let isSuccess = true
    if(location !== "Jagodina")
        isSuccess = false
    const attempt = await prisma.clockAttempt.create({
        data: {
            userId,
            type: ClockType.IN,
            success:isSuccess,
        },
    })

    if (!isSuccess) {
        return NextResponse.json({ error: "Clock-in failed" }, { status: 400 })
    }

    const sessionEntry = await prisma.clockSession.create({
        data: {
            userId,
            clockInEventId: attempt.id,
            clockOutEventId: null,
        },
    })

    return NextResponse.json({ session: sessionEntry }, { status: 200 })
}
