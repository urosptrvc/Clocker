import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActiveSessionDisplay } from "./ActiveSessionDisplay";
import { ClockInForm } from "./ClockInForm";
import {ClockOutForm} from "@/app/(dashboard)/clocktime/_components/ClockOutForm";

export function WorkSessionMechanicCard({ isClocked, activeSession, clockActions }) {
    const {
        load,
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
                        <ClockOutForm
                            load={load}
                            setLocation={setLocation}
                            notes={notes}
                            setNotes={setNotes}
                            onSubmit={handleClockOut}
                        />
                    </div>
                ) : (
                    <ClockInForm
                        load={load}
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