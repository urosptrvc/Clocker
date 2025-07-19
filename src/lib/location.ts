import {KNOWN_LOCATIONS} from "@/lib/const";

// Funkcija za računanje distance između dve koordinate (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radius Zemlje u metrima
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance u metrima
}

// Dinamička verifikacija bez hardkodovanih koordinata
export async function verifyLocationDynamic(location: string, userCoords: {lat: number, lng: number}): Promise<boolean> {
    try {

        const locationCoords = await KNOWN_LOCATIONS[location];
        if (!locationCoords) {
            console.log(`Nije moguće pronaći koordinate za: ${location}`);
            return false;
        }

        // Računanje distance
        const distance = calculateDistance(
            userCoords.lat,
            userCoords.lng,
            locationCoords.lat,
            locationCoords.lng
        );

        console.log(`Distance od ${location}: ${distance.toFixed(2)} metara`);

        const ALLOWED_RADIUS = 400;
        return distance <= ALLOWED_RADIUS;

    } catch (error) {
        console.error("Greška pri dinamičkoj verifikaciji:", error);
        return false;
    }
}