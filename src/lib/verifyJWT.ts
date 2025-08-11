import {UserSession} from "@/lib/utils";
import {getSession} from "@/lib/signJWT";

export const verifyToken = async (apiToken: string): Promise<UserSession | null> => {
    if (!apiToken) return null
    try {
        const session: UserSession = await validateUserSession()
        if (!session) throw new Error("Tool API Validation > Token Invalid")
        return session
    } catch (err) {
        console.log(`Error decoding token: ${err}`)
        return null
    }
}

export const validateUserSession = async (): Promise<UserSession> => {
    return getSession()
}