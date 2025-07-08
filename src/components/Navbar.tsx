"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut, useSession } from "next-auth/react"
import { useNotifier } from "@/app/hooks/useNotifications"
import { redirect, usePathname } from "next/navigation"
import Image from "next/image"
import PopUp from "./PopUp"
import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"

const Navbar = () => {
    const { notifySuccess, notifyError } = useNotifier()
    const pathname = usePathname()
    const [isModalOpen, setModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const session = useSession()

    if (!session) redirect("/login")

    const hiddenRoutes = ["/auth/login", "/auth/register"]
    if (hiddenRoutes.includes(pathname)) {
        return null
    }

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await signOut({
                callbackUrl: "/auth/login",
                redirect: true,
            })
            notifySuccess("Success", "Logged out successfully!")
            setModalOpen(false)
        } catch (error) {
            notifyError("Error", "Failed to log out.")
            console.error("Logout error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const openModal = () => setModalOpen(true)

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b shadow sticky top-0 bg-background/80 backdrop-blur-sm z-50"
            >
                <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <div className="flex flex-col space-y-6 mt-6">
                                    {/* Theme Switcher in Mobile */}
                                    <div className="flex items-center space-x-3">
                                        <ThemeSwitcherBtn />
                                        <span className="text-sm">Promeni temu</span>
                                    </div>

                                    {/* Admin Panel Link in Mobile */}
                                    {session?.data?.user?.role === "admin" && (
                                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full justify-start bg-transparent">
                                                Admin Panel
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Logout Button in Mobile */}
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            openModal()
                                        }}
                                        className="w-full justify-start"
                                    >
                                        Odjavi se
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Theme Switcher */}
                    <div className="hidden md:flex items-center space-x-3 flex-1">
                        <ThemeSwitcherBtn />
                        <span className="text-sm">Promeni temu</span>
                    </div>

                    {/* Logo - Center on Desktop, Right on Mobile */}
                    <div className="flex justify-center items-center flex-1 md:flex-1">
                        <Link href="/clocktime">
                            <div className="flex flex-col items-center hover:opacity-90 transition-opacity">
                                <Image src="/logo.png" alt="Logo" width={50} height={50} />
                                <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mt-1 md:mt-2 text-center leading-tight">
                                    Energo Solutions Clocker
                                </h1>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-1 justify-end">
                        {session?.data?.user?.role === "admin" && (
                            <Link href="/admin">
                                <Button variant="outline" className="text-sm bg-transparent">
                                    Admin Panel
                                </Button>
                            </Link>
                        )}
                        <Button variant="destructive" onClick={openModal}>
                            Odjavi se
                        </Button>
                    </div>

                    {/* Mobile Spacer */}
                    <div className="md:hidden w-10"></div>
                </div>
            </motion.nav>

            <PopUp
                open={isModalOpen}
                onOpenChange={setModalOpen}
                onClick1={handleLogout}
                textTitle="Jeste li sigurno da zelite da se odjavite?"
                textDesc={`Ova radnja se ne može opozvati.
                Moraćete ponovo da se prijavite i bićete preusmereni na stranicu za prijavu`}
                btnfunction="Potvrdi"
                isLoading={isLoading}
            />
        </>
    )
}

export default Navbar
