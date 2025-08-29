
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"

export default function ForbiddenPage() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center  p-4">
            <Card className="max-w-md w-full shadow-xl border-red-300">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-red-600">403 – Zabranjen pristup</CardTitle>
                    <CardDescription className="text-base ">
                        Nemate dozvolu da pristupite ovoj stranici.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Nazad
                    </Button>
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