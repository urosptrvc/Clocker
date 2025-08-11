"use client"

import Cookies from "js-cookie"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { decodeJwt } from "jose"
import {UserSession} from "@/lib/utils";

interface UserContextType {
    user: UserSession | null
    login: (userData: UserSession | null) => void
    logout: () => void
    loading: boolean
}

const tokenName = process.env.NEXT_PUBLIC_AUTH_TOKEN
const UserContext = createContext<UserContextType | any>(undefined)

// Custom hook to access the user context
export const useUserContext: any = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("User Context must be used within an User Provider")
    }
    return context
}

// Decode the token as a current sesion Details
// Frontend Decode (no secret and validation)
export async function decodeToken(token: any): Promise<UserSession | null> {
    try {
        if (!token) {
            console.error("Token is empty")
            return null
        }
        const decodedToken: any = await decodeJwt(token)
        if (!decodedToken) {
            console.error("Decoded token is empty")
            return null
        }

        if (!decodedToken.username) {
            console.error("Invalid Token")
            return null
        }
        return decodedToken
    } catch (error) {
        console.error("Error decoding token:", error)
        return null
    }
}

// User context provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserSession | null>(null)
    const [loading, setLoading] = useState(true)

    const login = (userData: UserSession, token: string) => {
        if (userData) {
            Cookies.set(tokenName, token, { expires: 0.7, path: "/" })
            setUser(userData)
        }
    }

    const logout = async () => {
        await Cookies.remove(tokenName)
        setUser(null)
    }

    const fetchCurrentUser = useCallback(async () => {
        setLoading(true)
        try {
            const userToken = Cookies.get(tokenName)
            if (userToken) {
                const decodedUser = await decodeToken(userToken)
                if (!decodedUser) throw new Error("Bad User Session")
                setUser(decodedUser)
            }
        } catch (error: any) {
            const message = error.message.error || error.message
            console.error("Error fetching user:", message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchCurrentUser()
    }, [fetchCurrentUser])

    return (
        <UserContext.Provider
            value={{
                user,
                login,
                logout,
                loadingUser: loading,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
