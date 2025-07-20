import {NextResponse} from "next/server"
import {ClockType} from "@prisma/client"
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {verifyLocationDynamic} from "@/lib/location";
import {KNOWN_LOCATIONS} from "@/lib/const";
import {saveImage} from "@/lib/saveImage";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401})
    }

    const userId = session.user.id

    const contentType = req.headers.get("content-type");

    let location = "";
    let notes = "";
    let coords: { lat: number; lng: number } = {lat: 0, lng: 0};
    const imagePaths = {front: null, back: null, mileage: null};

    if (contentType?.includes("multipart/form-data")) {
        const formData = await req.formData();
        location = formData.get("location") as string;
        notes = formData.get("notes") as string;
        coords = JSON.parse(formData.get("coords") as string);

        imagePaths.front = await saveImage(formData.get("frontTruckImage") as File, userId,"CLOCKOUT")
        imagePaths.back = await saveImage(formData.get("backTruckImage") as File, userId,"CLOCKOUT")
        imagePaths.mileage = await saveImage(formData.get("mileageImage") as File, userId,"CLOCKOUT")

    } else {
        const body = await req.json();
        location = body.location;
        notes = body.notes;
        coords = body.coords;
    }

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

    const locationPlace = KNOWN_LOCATIONS[location]?.locc==null ? location : KNOWN_LOCATIONS[location]?.locc
    const attempt = await prisma.clockAttempt.create({
        data: {
            userId,
            type: ClockType.OUT,
            location: locationPlace,
            notes: notes,
            success: isSuccess,
            FrontTruckPath: imagePaths.front,
            BackTruckPath: imagePaths.back,
            DashboardPath: imagePaths.mileage,
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

    const clockIn = await prisma.clockAttempt.findUnique({
        where: { id: openSession.clockInEventId },
        select: { timestamp: true },
    })

    const clockOut = attempt.timestamp

    if (clockIn) {
        const totalMinutes = Math.floor((clockOut.getTime() - clockIn.timestamp.getTime()) / 60000)
        const regularMinutes = Math.min(600, totalMinutes)
        const overtimeMinutes = Math.max(0, totalMinutes - 600)

        await prisma.clockSession.update({
            where: { id: openSession.id },
            data: {
                durationMinutes: totalMinutes,
                regularMinutes,
                overtimeMinutes,
            },
        })
    }

    return NextResponse.json({session: updated}, {status: 200})
}
