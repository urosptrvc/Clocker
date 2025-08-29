
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"

export default function NotFoundPage() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center  p-4">
            <Card className="max-w-md w-full shadow-xl ">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold ">404 – Stranica nije pronađena</CardTitle>
                    <CardDescription className="text-base ">
                        Stranica koju tražite ne postoji ili je uklonjena.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 mt-4">
                    <Button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2"
                    >
                        <Home size={18} /> Početna
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}