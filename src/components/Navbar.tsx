"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useNotifier } from "@/app/hooks/useNotifications";
import { usePathname } from "next/navigation";
import Image from "next/image";
import PopUp from "./PopUp";
import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn";
import { motion } from "framer-motion";
import AdminPanel from "@/components/UploadLink";

const Navbar = () => {
    const { notifySuccess, notifyError } = useNotifier();
    const pathname = usePathname();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const hiddenRoutes = ["/auth/login", "/auth/register"];
    if (hiddenRoutes.includes(pathname)) {
        return null;
    }

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOut({
                callbackUrl: "/auth/login",
                redirect: true,
            });
            notifySuccess("Success", "Logged out successfully!");
            setModalOpen(false);
        } catch (error) {
            notifyError("Error", "Failed to log out.");
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => setModalOpen(true);

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b shadow sticky top-0 bg-background/80 backdrop-blur-sm z-50"
            >
                    <div className="container mx-auto flex items-center py-4 px-6">

                        <div className="flex items-center space-x-3 flex-1">
                            <ThemeSwitcherBtn/>
                            <span className="text-sm">Promeni temu</span>
                        </div>

                        <div className="flex justify-center items-center flex-1">
                            <Link href="/clocktime" legacyBehavior>
                                <a className="flex flex-col items-center hover:opacity-90 transition-opacity">
                                    <Image src="/logo.png" alt="Logo" width={50} height={50}/>
                                    <h1 className="text-l font-bold mt-2">Energo Solutions Clocker</h1>
                                </a>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-6 flex-1 justify-end">
                            <AdminPanel/>
                            <Button variant="destructive" onClick={openModal}>
                                Logout
                            </Button>
                        </div>
                    </div>

            </motion.nav>
            <PopUp
                open={isModalOpen}
                onOpenChange={setModalOpen}
                onClick1={handleLogout}
                textTitle="Are you sure you want to log out?"
                textDesc={`This action cannot be undone.
                You will have to login again and will be redirected to login page.`}
                btnfunction="Confirm"
                isLoading={isLoading}
            />
        </>
    );
};

export default Navbar;
