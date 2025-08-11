import {getSession} from "@/lib/signJWT";

export async function fetchUser() {
    const userSession = await getSession();
    return userSession;
}