"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, UserIcon } from "lucide-react"
import { formatDate, formatTime } from "@/lib/helper"

export function AttemptsTab({ users }) {
    return (
        <Accordion type="multiple" className="space-y-4">
            {users.map((korisnik) => (
                <AccordionItem key={korisnik.id} value={korisnik.id.toString()} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 flex items-center gap-2 text-left text-lg font-medium">
                        <UserIcon className="h-5 w-5" />
                        {korisnik.name} - Pokušaji prijavljivanja
                    </AccordionTrigger>
                    <AccordionContent>
                        <Card className="border-none shadow-none">
                            <CardContent className="space-y-2 pt-0">
                                {korisnik.clockAttempts.length === 0 ? (
                                    <div className="text-muted-foreground italic">Nema zabeleženih pokušaja</div>
                                ) : (
                                    korisnik.clockAttempts
                                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                        .map((pokusaj) => (
                                            <div key={pokusaj.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    {pokusaj.success ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">
                                                            {`Clock ${pokusaj.type} - ${formatDate(pokusaj.timestamp)}`}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatTime(pokusaj.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant={pokusaj.success ? "default" : "destructive"}>
                                                    {pokusaj.success ? "Uspešno" : "Neuspešno"}
                                                </Badge>
                                            </div>
                                        ))
                                )}
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
