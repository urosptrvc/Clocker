import "./globals.css";
import type {Metadata} from "next";
import {Toaster} from "@/components/ui/toaster";
import React from "react";
import Navbar from "@/components/Navbar";
import {UserProvider} from "@/context/UserContext";
import {ThemeProvider} from "next-themes";

export const metadata: Metadata = {
    title: "VS Energy Clocker",
    description: "VS Energy Clocker",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
        <UserProvider>
            <Toaster/>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <Navbar/>
                <main>{children}</main>
            </ThemeProvider>
        </UserProvider>
        </body>
        </html>
    )
        ;
}

