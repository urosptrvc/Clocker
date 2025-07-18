import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Nemate privilegiju" }, { status: 401 })
        }
        const body = await req.json()
        const { username, password, name, role, satnica } = body

        if (!username || !password) {
            return NextResponse.json(
                { error: "Korisničko ime i lozinka su obavezni." },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        })
        if (existingUser) {
            return NextResponse.json(
                { error: "Korisnik sa tim emailom već postoji." },
                { status: 400 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                role: role && role !== "" ? role : "user",
                hourly_rate: satnica
            }
        })

        return NextResponse.json(
            { message: "Korisnik uspešno kreiran", userId: newUser.id },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || "Došlo je do greške." },
                { status: 500 }
            )
        }
    }
}
