import { useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";

export function useClockActions(fetchClockedState) {
    const [location, setLocation] = useState("");
    const [load,isLoad] = useState(false);
    const [notes, setNotes] = useState("");
    const { apiPost } = useApi();
    const { notifyError, notifySuccess } = useNotifier();

    async function handleClockOut() {
        try {
            isLoad(true);
            await apiPost("/api/clockout", { location: location || "Jagodina" });
            notifySuccess("Success", "Clocked out successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
            isLoad(false)
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            isLoad(false)
        }
    }

    async function handleClockInSubmit(e) {
        e.preventDefault();
        try {
            isLoad(true)
            await apiPost("/api/clockin", {
                location: location || "Jagodina",
                notes: notes
            });
            notifySuccess("Success", "Clocked in successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
            isLoad(false)
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            isLoad(false)
        }
    }

    return {
        load,
        location,
        setLocation,
        notes,
        setNotes,
        handleClockOut,
        handleClockInSubmit
    };
}