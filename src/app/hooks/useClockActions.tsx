import { useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";
import {useSession} from "next-auth/react";

export function useClockActions(fetchClockedState) {
    const [location, setLocation] = useState("");
    const [frontTruckImage, setFrontTruckImage] = useState(null)
    const [backTruckImage, setBackTruckImage] = useState(null)
    const [mileageImage, setMileageImage] = useState(null)
    const [load, isLoad] = useState(false);
    const [notes, setNotes] = useState("");
    const { apiPost } = useApi();
    const { notifyError, notifySuccess } = useNotifier();
    const session = useSession();

    async function handleClockOut() {
        try {
            isLoad(true);
            const coords = await getCoords();
            let payload = {}
            if (session?.data?.user?.role === "teren") {
                const formData = new FormData()
                formData.append("location", location)
                formData.append("notes", notes)
                formData.append("coords", JSON.stringify(coords))
                formData.append("frontTruckImage", frontTruckImage)
                formData.append("backTruckImage", backTruckImage)
                formData.append("mileageImage", mileageImage)
                payload = formData
            } else {
                payload = {
                    location,
                    notes,
                    coords,
                }
            }
            await apiPost("/api/clockout", payload);
            notifySuccess("Success", "Clocked out successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
            setFrontTruckImage(null);
            setBackTruckImage(null);
            setMileageImage(null);
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
            if (!session) {
                return;
            }
            isLoad(true);
            const coords = await getCoords();
            let payload = {}
            if (session?.data?.user?.role === "teren") {
                const formData = new FormData()
                formData.append("location", location)
                formData.append("notes", notes)
                formData.append("coords", JSON.stringify(coords))
                formData.append("frontTruckImage", frontTruckImage)
                formData.append("backTruckImage", backTruckImage)
                formData.append("mileageImage", mileageImage)
                payload = formData
            } else {
                payload = {
                    location,
                    notes,
                    coords,
                }
            }
            await apiPost("/api/clockin", payload);
            notifySuccess("Success", "Clocked in successfully!");
            await fetchClockedState();
            setLocation("");
            setNotes("");
            setFrontTruckImage(null);
            setBackTruckImage(null);
            setMileageImage(null);
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
        frontTruckImage,
        backTruckImage,
        mileageImage,
        setFrontTruckImage,
        setBackTruckImage,
        setMileageImage,
        handleClockOut,
        handleClockInSubmit,
    };
}
