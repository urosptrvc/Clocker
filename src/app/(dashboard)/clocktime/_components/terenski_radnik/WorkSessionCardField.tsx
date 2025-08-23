import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClockInFormField } from "./ClockInFormField";
import {ClockOutFormField} from "@/app/(dashboard)/clocktime/_components/terenski_radnik/ClockOutFormField";
import {ActiveSessionDisplay} from "@/app/(dashboard)/clocktime/_components/ActiveSessionDisplay";

export function WorkSessionCardField({ isClocked, activeSession, clockActions }) {
    const {
        load,
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
                        <ClockOutFormField
                            load={load}
                            setLocation={setLocation}
                            notes={notes}
                            setNotes={setNotes}
                            onSubmit={handleClockOut}
                            front={frontTruckImage}
                            back={backTruckImage}
                            mileage={mileageImage}
                            setFront={setFrontTruckImage}
                            setBack={setBackTruckImage}
                            setMileage={setMileageImage}
                        />
                    </div>
                ) : (
                    <ClockInFormField
                        load={load}
                        setLocation={setLocation}
                        notes={notes}
                        setNotes={setNotes}
                        onSubmit={handleClockInSubmit}
                        front={frontTruckImage}
                        back={backTruckImage}
                        mileage={mileageImage}
                        setFront={setFrontTruckImage}
                        setBack={setBackTruckImage}
                        setMileage={setMileageImage}
                    />
                )}
            </CardContent>
        </Card>
    );
}