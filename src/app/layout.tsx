import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";


export const metadata: Metadata = {
    title: "Energo Clocker",
    description: "Energo Solutions Work Clocker",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Toaster />
            <Providers>
                <Navbar />
                <main>{children}</main>
            </Providers>
        </body>
        </html>
    );
}
