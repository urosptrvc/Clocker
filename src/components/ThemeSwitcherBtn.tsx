"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcherBtn() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const icon =
        theme === "system" ? (
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
        ) : theme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
        )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    {icon}
                    <span className="sr-only">Promeni temu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Svetlo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Tamno
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    Sistemski
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
