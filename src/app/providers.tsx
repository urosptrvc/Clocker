"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import {ThemeProvider} from "next-themes";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SessionProvider>
                {children}
            </SessionProvider>
        </ThemeProvider>
    );
}

export default Providers;
