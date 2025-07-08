import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveSessionDisplay } from "./ActiveSessionDisplay";
import { ClockInForm } from "./ClockInForm";
import {Loader2} from "lucide-react";

export function WorkSessionCard({ isClocked, activeSession, clockActions }) {
    const {
        load,
        location,
        setLocation,
        notes,
        setNotes,
        handleClockOut,
        handleClockInSubmit
    } = clockActions;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <span>Radna sesija</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isClocked && activeSession ? (
                    <div className="space-y-4">
                        <ActiveSessionDisplay activeSession={activeSession} />
                        <Button
                            onClick={handleClockOut}
                            size="lg"
                            className="w-full"
                            variant="destructive"
                            disabled={load}
                        >
                            {load ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Zavrsi radno vreme
                        </Button>
                    </div>
                ) : (
                    <ClockInForm
                        load={load}
                        location={location}
                        setLocation={setLocation}
                        notes={notes}
                        setNotes={setNotes}
                        onSubmit={handleClockInSubmit}
                    />
                )}
            </CardContent>
        </Card>
    );
}