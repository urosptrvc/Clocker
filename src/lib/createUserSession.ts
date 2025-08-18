import {UserSession} from "@/lib/utils";

export const createUserSession = (user):UserSession => {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        hourly_rate: user.hourly_rate,
        extended_rate: user.extended_rate,
        isActive: user.isActive,
        exp: user.exp
    }
}