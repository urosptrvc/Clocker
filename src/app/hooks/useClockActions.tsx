import { useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";

export function useClockActions(fetchClockedState) {
    const [location, setLocation] = useState("");
    const [load, isLoad] = useState(false);
    const [notes, setNotes] = useState("");
    const { apiPost } = useApi();
    const { notifyError, notifySuccess } = useNotifier();

    async function handleClockOut() {
        try {
            isLoad(true);
            const coords = await getCoords();
            const payload = {
                location,
                notes,
                coords,
            };
            await apiPost("/api/clockout", payload);
            notifySuccess("Success", "Clocked out successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error || "Clock-out failed.");
        } finally {
            isLoad(false);
        }
    }

    async function handleClockInSubmit(e) {
        e.preventDefault();
        try {
            isLoad(true);
            const coords = await getCoords();
            const payload = {
                location,
                notes,
                coords,
            };
            await apiPost("/api/clockin", payload);
            notifySuccess("Success", "Clocked in successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error || "Clock-in failed.");
        } finally {
            isLoad(false);
        }
    }

    async function getCoords() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return reject(new Error("Geolokacija nije podržana."));
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ lat: latitude, lng: longitude });
                },
                (error) => {
                    reject(new Error(`Neuspešno pribavljanje lokacije. ${error}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }

    return {
        load,
        location,
        setLocation,
        notes,
        setNotes,
        handleClockOut,
        handleClockInSubmit,
    };
}
