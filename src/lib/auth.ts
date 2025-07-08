import {AuthOptions} from "next-auth";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import {prisma} from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import {compare} from "bcrypt";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const { username, password } = credentials ?? {}
                if (!username || !password) {
                    throw new Error("Email and password are required.")
                }
                const user = await prisma.user.findUnique({ where: { username } })
                if (!user) {
                    throw new Error("User not found.");
                }
                const isValid = await compare(password, user.password)
                if (!isValid) throw new Error("Invalid password.")
                return { id: user.id, username: user.username, name: user.name, role: user.role }
            },
        }),
    ],
    session: { strategy: "jwt" },
    jwt: { secret: process.env.NEXTAUTH_SECRET || "super-secret" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        },
    },
}