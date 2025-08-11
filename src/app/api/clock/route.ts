import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma";
import {ValidateApiToken} from "@/lib/validateApiToken";

export async function GET() {
    const userSession = await ValidateApiToken()
    const activeSession = await prisma.clockSession.findFirst({
        where: {
            userId: userSession.id,
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
