import { useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";

export function useClockActions(fetchClockedState) {
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const { apiPost } = useApi();
    const { notifyError, notifySuccess } = useNotifier();

    async function handleClockOut() {
        try {
            await apiPost("/api/clockout", { location: location || "Jagodina" });
            notifySuccess("Success", "Clocked out successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
        }
    }

    async function handleClockInSubmit(e) {
        e.preventDefault();

        try {
            await apiPost("/api/clockin", {
                location: location || "Jagodina",
                notes: notes
            });
            notifySuccess("Success", "Clocked in successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
        }
    }

    return {
        location,
        setLocation,
        notes,
        setNotes,
        handleClockOut,
        handleClockInSubmit
    };
}