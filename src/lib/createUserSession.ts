import {UserSession} from "@/lib/utils";

export const createUserSession = (user):UserSession => {
    const currentUnix = Math.floor(Date.now() / 1000);
    const exp = currentUnix + 30 * 24 * 60 * 60;
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        hourly_rate: user.hourly_rate,
        extended_rate: user.extended_rate,
        isActive: user.isActive,
        exp: exp
    }
}