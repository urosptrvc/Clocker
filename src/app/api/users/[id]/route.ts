import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {hash} from "bcrypt";

export async function GET(req: NextRequest, {params}) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: params.id, isActive: "1"},
            include: {
                clockAttempts: true,
                clockSessions: true,
            },
        });

        if (!user) {
            return NextResponse.json({error: "Korisnik nije pronađen"}, {status: 404});
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Greška prilikom dohvatanja korisnika:", error);
        return new NextResponse("Greška na serveru", {status: 500});
    }
}

export async function PATCH(req: NextRequest, {params}) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401});
    }

    const {id} = params;
    const data = await req.json();

    try {
        const updateData: any = {
            name: data.name,
            username: data.username,
            role: data.role,
            hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
        };

        if (data.password) {
            updateData.password = await hash(data.password, 10)
        }
        await prisma.user.update({
            where: {id, isActive: "1"},
            data: updateData,
        });
        return NextResponse.json({success: true}, {status: 200});
    } catch (error) {
        console.error("Greška prilikom ažuriranja korisnika:", error);
        return NextResponse.json({error: "Greška prilikom ažuriranja korisnika"}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, {params}) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401});
    }

    const {id} = params

    try {
        const softDeletedUser = await prisma.user.update({
            where: {id},
            data: {isActive: "0"},
        })

        return NextResponse.json({success: true, user: softDeletedUser})
    } catch (error) {
        console.error("Greška prilikom soft delete-a:", error)
        return NextResponse.json({error: "Greška prilikom brisanja korisnika"}, {status: 500})
    }
}