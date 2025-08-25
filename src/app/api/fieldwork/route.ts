import {ValidateApiToken} from "@/lib/validateApiToken";
import {NextResponse, NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const fieldNote = await req.json();
    const userSession = await ValidateApiToken()
    if (!userSession) {
        return NextResponse.json(
            {error: "Nemate pristup"},
            {status: 403}
        )
    }

    // fieldNotes: {time: 3193193911, notes: "izlazak"}
    try {
        const activeSession = await prisma.clockSession.findFirst({
            where: {
                userId: userSession.id,
                clockOutEventId: null,
            }
        });
        if (!activeSession) {
            return NextResponse.json({error: "Nema aktivne sesije"}, {status: 404});
        }
        const fieldWork = activeSession.fieldWork || { fieldNotes: [] };

        fieldWork.fieldNotes = [
            ...(fieldWork.fieldNotes || []),
            fieldNote
        ];

        await prisma.clockSession.update({
            where: {id: activeSession.id},
            data: {fieldWork},
        });

        const openSession = await prisma.clockSession.findFirst({
            where: {
                userId: userSession.id,
                clockOutEventId: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json({success: true},openSession);
    } catch (e) {
        return NextResponse.json({error: e});
    }

}