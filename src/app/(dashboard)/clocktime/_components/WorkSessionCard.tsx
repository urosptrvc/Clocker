import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveSessionDisplay } from "./ActiveSessionDisplay";
import { ClockInForm } from "./ClockInForm";

export function WorkSessionCard({ isClocked, activeSession, clockActions }) {
    const {
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
                        >
                            Zavrsi radno vreme
                        </Button>
                    </div>
                ) : (
                    <ClockInForm
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