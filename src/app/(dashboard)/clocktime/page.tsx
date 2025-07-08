"use client"

import {useEffect, useState} from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";
import {useClockActions} from "@/app/hooks/useClockActions";
import {useClockingState} from "@/app/hooks/useClockState";
import {CurrentTimeCard} from "@/app/(dashboard)/clocktime/_components/CurrentTimeCard";
import {WorkSessionCard} from "@/app/(dashboard)/clocktime/_components/WorkSessionCard";
import {Skeleton} from "@/components/ui/skeleton";

export default function ClockTime() {
    const session = useSession();
    if(!session) redirect("/login");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);
    const currentSession = useSession();
    const {isLoading, clocked, activeSession, fetchClockedState } = useClockingState();
    const clockActions = useClockActions(fetchClockedState);

    if (!currentSession) {
        redirect("/login");
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Clock Time</h1>
                    <p className="text-muted-foreground">Prati svoje vreme na poslu</p>
                </div>
                <Link href="/history">
                    <Button variant="outline" className="flex items-center gap-2">
                        <History className="h-4 w-4"/>
                        Pregledaj istoriju
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                <CurrentTimeCard currentTime={currentTime} />
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-md" />
                    </div>
                ) : (
                    <WorkSessionCard
                        isClocked={clocked}
                        activeSession={activeSession}
                        clockActions={clockActions}
                    />
                )}
            </div>
        </div>
    );
}