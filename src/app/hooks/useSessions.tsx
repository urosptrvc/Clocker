"use client"

import {useState, useEffect} from "react";
import {useApi} from "@/app/hooks/useApi";
import {useNotifier} from "@/app/hooks/useNotifications";

export function useSessions() {
    const [sessions, setSessions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const {apiGet} = useApi();
    const {notifyError} = useNotifier();

    async function fetchSessions() {
        setIsLoading(true);
        try {
            const req = await apiGet("/api/sessions");
            const res = await req.json()
            if (res) {
                setSessions(res);
            } else {
                setSessions(null);
            }
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            setSessions(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        sessions,
        fetchSessions,
        isLoading,
    };
}
