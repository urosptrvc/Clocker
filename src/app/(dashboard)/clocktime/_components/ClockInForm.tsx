import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {Loader2} from "lucide-react";

export function ClockInForm({load, location, setLocation, notes, setNotes, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="location">Location (mandatory)</Label>
                    <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your location"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes"
                    />
                </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={load}>
                {load ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Pocni radno vreme
            </Button>
        </form>
    );
}