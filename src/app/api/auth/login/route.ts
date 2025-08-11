import {NextRequest, NextResponse} from "next/server"

import {prisma} from "@/lib/prisma";
import {UserSession} from "@/lib/utils";
import {createUserSession} from "@/lib/createUserSession";
import {signToken} from "@/lib/signJWT";
import {compare} from "bcrypt";

export async function POST(request: NextRequest) {
    const data = await request.json()
    const {username, password} = data
    if (!username || !password) {
        return NextResponse.json("Missing Username/Password. Request not valid.", {status: 400})
    }
    try {
        const getUser = await prisma.user.findUnique({where: {username: username, isActive: "1"}})
        if (!getUser) {
            return NextResponse.json("User Not Found. Please check your username and password.", {status: 400})
        }
        const isMatch = await compare(password, getUser.password);
        if (!isMatch) {
            return NextResponse.json("Please check your username and password.", {status: 400});
        }
        const userSession: UserSession = createUserSession(getUser)
        const userJwtToken = await signToken(userSession)
        const authorizedUser = {
            user: userSession,
            token: userJwtToken,
        }
        console.log("Created user", authorizedUser)
        return NextResponse.json(authorizedUser, {status: 200})
    } catch (error) {
        return NextResponse.json(error, {status: 400})
    }
}
