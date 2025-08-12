"use client"

import { useState, useEffect } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";

export function useClockingState() {
    const [clocked, setClocked] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { apiGet } = useApi();
    const { notifyError } = useNotifier();

    async function fetchClockedState() {
        setIsLoading(true);
        try {
            const req = await apiGet("/api/clock");
            const res = await req.json()
            if (res.activeSession) {
                setClocked(true);
                setActiveSession(res.activeSession);
            } else {
                setClocked(false);
                setActiveSession(null);
            }
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            setClocked(false);
            setActiveSession(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchClockedState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        clocked,
        activeSession,
        fetchClockedState,
        isLoading,
    };
}
