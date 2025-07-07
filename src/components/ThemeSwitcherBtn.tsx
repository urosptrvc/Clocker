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
    const [isSystemTheme, setIsSystemTheme] = React.useState(false)

    React.useEffect(() => {
        setIsSystemTheme(theme === "system")
    }, [theme])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    {isSystemTheme ? (
                        <Monitor className="h-[1.2rem] w-[1.2rem]" />
                    ) : theme === "dark" ? (
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                    ) : (
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                    )}
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