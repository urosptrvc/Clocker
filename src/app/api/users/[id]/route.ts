import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function GET(
    req: Request,
    {params}: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "admin") {
        return NextResponse.json({error: "Nemate privilegiju"}, {status: 401});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: params.id},
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
