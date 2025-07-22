import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {useNotifier} from "@/app/hooks/useNotifications";
import {predefinedLocations} from "@/lib/const";

export function ClockOutForm({ load, setLocation, notes, setNotes, onSubmit }) {
    const [customLocation, setCustomLocation] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const {notifyError} = useNotifier()
    const handleLocationChange = (value) => {
        if (value === "custom") {
            setIsCustom(true);
            setLocation("");
        } else {
            setIsCustom(false);
            setLocation(value);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (isCustom && notes.trim() === "") {
                    notifyError("Opis je obavezan kada je lokacija rucno unesena");
                    return;
                }
                onSubmit(e);
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="location">Lokacija</Label>
                    <Select onValueChange={handleLocationChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a location" />
                        </SelectTrigger>
                        <SelectContent>
                            {predefinedLocations.map((loc) => (
                                <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                            ))}
                            <SelectItem value="custom">Other (type manually)</SelectItem>
                        </SelectContent>
                    </Select>

                    {isCustom && (
                        <Input
                            className="mt-2"
                            value={customLocation}
                            onChange={(e) => {
                                setCustomLocation(e.target.value);
                                setLocation(e.target.value);
                            }}
                            placeholder="Unesite lokaciju"
                            required
                        />
                    )}
                </div>

                <div>
                    <Label htmlFor="notes">Napomene</Label>
                    <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Dodajte napomene"
                    />
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full" variant="destructive" disabled={load}>
                {load && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Zavrsi radno vreme
            </Button>
        </form>
    );
}
