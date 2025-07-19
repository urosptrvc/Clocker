import { Timer, MapPin } from "lucide-react";
import {formatTime, formatDuration, getSessionDuration} from "@/lib/helper";

export function ActiveSessionDisplayField({ activeSession }) {
    return (
        <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4"/>
                <span className="font-medium">
                    Zapoceto: {formatTime(new Date(activeSession.clockInEvent.timestamp))}
                </span>
            </div>
            <p className="text-lg font-mono">
                Trajanje: {formatDuration(getSessionDuration(activeSession))}
            </p>
            {activeSession.clockInEvent?.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3"/>
                    {activeSession.clockInEvent.location}
                </p>
            )}
            {activeSession.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                    Notes: {activeSession.notes}
                </p>
            )}
        </div>
    );
}