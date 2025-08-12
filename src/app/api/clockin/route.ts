import {NextResponse} from "next/server"
import {ClockType} from "@prisma/client"
import {prisma} from "@/lib/prisma";
import {verifyLocationDynamic} from "@/lib/location";
import {KNOWN_LOCATIONS} from "@/lib/const";
import {saveImage} from "@/lib/saveImage";
import {ValidateApiToken} from "@/lib/validateApiToken";

export async function POST(req: Request) {
    const userSession = await ValidateApiToken()
    console.log('userSession', userSession)
    if(!userSession){
        return NextResponse.json(
            { error: "Nemate pristup" },
            { status: 403 }
        )
    }
    const userId = userSession.id;

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

        imagePaths.front = await saveImage(formData.get("frontTruckImage") as File, userId,"CLOCKIN")
        imagePaths.back = await saveImage(formData.get("backTruckImage") as File, userId,"CLOCKIN")
        imagePaths.mileage = await saveImage(formData.get("mileageImage") as File, userId,"CLOCKIN")

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
            if (!isSuccess) console.log(`Nije u blizini ${location}`);
        } catch (err) {
            console.error("Greška:", err);
            isSuccess = false;
        }
    } else if (!notes) {
        return NextResponse.json({error: "Clock-in nije uspeo"}, {status: 400});
    }

    const locationPlace = KNOWN_LOCATIONS[location]?.locc==null ? location : KNOWN_LOCATIONS[location]?.locc
    const attempt = await prisma.clockAttempt.create({
        data: {
            userId,
            type: ClockType.IN,
            location: locationPlace,
            notes,
            success: isSuccess,
            FrontTruckPath: imagePaths.front,
            BackTruckPath: imagePaths.back,
            DashboardPath: imagePaths.mileage,
        },
    });

    if (!isSuccess) {
        return NextResponse.json({error: "Clock-in nije uspeo"}, {status: 400});
    }

    const sessionEntry = await prisma.clockSession.create({
        data: {
            userId,
            clockInEventId: attempt.id,
            clockOutEventId: null,
        },
    });

    return NextResponse.json({session: sessionEntry}, {status: 200});
}
