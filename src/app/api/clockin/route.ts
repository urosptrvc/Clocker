import {NextResponse} from "next/server"
import {ClockType} from "@prisma/client"
import {getServerSession} from "next-auth";
import {prisma} from "@/lib/prisma";
import {authOptions} from "@/lib/auth";
import {verifyLocationDynamic} from "@/lib/location";
import {KNOWN_LOCATIONS} from "@/lib/const";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401})
    }
    const userId = session.user.id
    const body = await req.json()
    const {location, notes, coords} = body;
    let isSuccess = true;
    if (KNOWN_LOCATIONS[location]) {
        try {
            isSuccess = await verifyLocationDynamic(location, coords);
            if (!isSuccess) {
                console.log(`Korisnik nije u dozvoljenoj blizini od ${location}`);
            }
        } catch (error) {
            console.error("Greška pri verifikaciji lokacije:", error);
            isSuccess = false;
        }
    } else if (!notes) {
        return NextResponse.json({error: "Clock-in nije uspeo"}, {status: 400})
    } else
        isSuccess = true


    const attempt = await prisma.clockAttempt.create({
        data: {
            userId,
            type: ClockType.IN,
            location: KNOWN_LOCATIONS[location]?.locc,
            notes: notes,
            success: isSuccess,
        },
    })

    if (!isSuccess) {
        return NextResponse.json({error: "Clock-in nije uspeo"}, {status: 400})
    }

    const sessionEntry = await prisma.clockSession.create({
        data: {
            userId,
            clockInEventId: attempt.id,
            clockOutEventId: null,
        },
    })

    return NextResponse.json({session: sessionEntry}, {status: 200})
}
