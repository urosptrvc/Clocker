"use client"
import React from 'react'
import {useClockingState} from "@/app/hooks/useClockState";
import {useClockActions} from "@/app/hooks/useClockActions";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {CurrentTimeCard} from "@/app/(dashboard)/clocktime/_components/CurrentTimeCard";
import {Skeleton} from "@/components/ui/skeleton";
import {WorkSessionCardField} from "@/app/(dashboard)/clocktime/_components/terenski_radnik/WorkSessionCardField";
import {WorkSessionCard} from "@/app/(dashboard)/clocktime/_components/WorkSessionCard";
import {HistoryIcon} from "lucide-react";
import {WorkSessionMechanicCard} from "@/app/(dashboard)/clocktime/_components/mehanicar/WorkSessionMechanicCard";

export default function ClockTimePage({session}) {
    const { isLoading, clocked, activeSession, fetchClockedState } = useClockingState();
    const clockActions = useClockActions(fetchClockedState);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Clock Time</h1>
                    <p className="text-muted-foreground">Dobar dan, {session.name}</p>
                </div>
                <Link href="/history">
                    <Button variant="outline" className="flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4" />
                        Pregledaj istoriju
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                <CurrentTimeCard />
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-md" />
                    </div>
                ) : session.role === "teren" ? (
                    <WorkSessionCardField
                        isClocked={clocked}
                        activeSession={activeSession}
                        clockActions={clockActions}
                    />
                ) : session.role === "mehanicar" ? (
                    <WorkSessionMechanicCard
                        isClocked={clocked}
                        activeSession={activeSession}
                        clockActions={clockActions}
                    />
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
