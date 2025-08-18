import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import {ValidateApiToken} from "@/lib/validateApiToken";

export async function POST(req: Request) {
    try {
        const userSession = await ValidateApiToken()
        if(userSession.role !== "admin"){
            return NextResponse.json(
                { error: "Samo admin ima pristup" },
                { status: 403 }
            )
        }
        const body = await req.json()
        const { username, password, name, role, satnica, prekovremeno } = body

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
                { error: "Korisnik sa tim usernameom već postoji." },
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
                hourly_rate: satnica,
                extended_rate: prekovremeno
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
