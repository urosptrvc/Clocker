import {NextResponse} from "next/server"
import {ClockType} from "@prisma/client"
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401})
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
            type: ClockType.OUT,
            success: isSuccess,
        },
    })

    if (!isSuccess) {
        return NextResponse.json({error: "Clock-out nije uspeo"}, {status: 400})
    }

    const openSession = await prisma.clockSession.findFirst({
        where: {
            userId,
            clockOutEventId: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    if (!openSession) {
        return NextResponse.json({error: "Nema trenutno clock-in sesije"}, {status: 400})
    }

    const updated = await prisma.clockSession.update({
        where: {
            id: openSession.id,
        },
        data: {
            clockOutEventId: attempt.id,
        },
    })

    return NextResponse.json({session: updated}, {status: 200})
}
