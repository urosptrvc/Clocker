"use client"

import { motion } from "framer-motion"
import { Zap, Lightbulb, Plug, Cable, Wrench, Bolt } from "lucide-react"
import type { ReactNode } from "react"

function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
            {/* Animated Electrical Icons */}
            <div className="fixed inset-0 overflow-hidden">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{
                        x: ["-100%", "200%"],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    className="absolute top-[20%] flex items-center gap-32"
                >
                    <Zap className="h-12 w-12 text-yellow-500/20" />
                    <Lightbulb className="h-8 w-8 text-amber-400/15" />
                    <Plug className="h-10 w-10 text-blue-500/20" />
                </motion.div>

                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{
                        x: ["-100%", "200%"],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        delay: 5,
                    }}
                    className="absolute top-[60%] flex items-center gap-40"
                >
                    <Cable className="h-10 w-10 text-orange-500/20" />
                    <Wrench className="h-12 w-12 text-gray-500/15" />
                    <Bolt className="h-8 w-8 text-yellow-400/20" />
                </motion.div>

                {/* Additional electrical elements */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{
                        x: ["-100%", "200%"],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        delay: 10,
                    }}
                    className="absolute top-[40%] flex items-center gap-36"
                >
                    <Lightbulb className="h-6 w-6 text-yellow-300/15" />
                    <Zap className="h-14 w-14 text-blue-400/10" />
                    <Cable className="h-9 w-9 text-orange-400/15" />
                </motion.div>
            </div>

            {children}

            {/* Electrical Circuit Background Pattern */}
            <div
                className="fixed inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fbbf24' strokeWidth='1'%3E%3Cpath d='M10 10h40v40H10z'/%3E%3Cpath d='M20 20h20v20H20z'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='15' cy='45' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3Cpath d='M15 10v5M45 10v5M15 45v5M45 45v5M10 15h5M10 45h5M50 15h5M50 45h5'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Subtle electrical glow effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
                <div
                    className="absolute top-2/3 left-1/2 w-20 h-20 bg-orange-400/5 rounded-full blur-xl animate-pulse"
                    style={{ animationDelay: "4s" }}
                />
            </div>
        </div>
    )
}

export default Layout
