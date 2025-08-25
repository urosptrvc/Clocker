import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActiveSessionDisplay } from "../ActiveSessionDisplay";
import {ClockInFormMechanics} from "@/app/(dashboard)/clocktime/_components/mehanicar/ClockInFormMechanics";
import { ClockOutFormMechanics } from "./ClockOutFormMechanics";
import {FieldWorkDisplay} from "@/app/(dashboard)/clocktime/_components/mehanicar/FieldWorkDisplay";

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
                        <FieldWorkDisplay activeSession={activeSession}/>
                        <ClockOutFormMechanics
                            load={load}
                            setLocation={setLocation}
                            notes={notes}
                            setNotes={setNotes}
                            onSubmit={handleClockOut}
                        />
                    </div>
                ) : (
                    <ClockInFormMechanics
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