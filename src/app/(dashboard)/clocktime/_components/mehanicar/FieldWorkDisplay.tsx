import {useState} from "react";
import {Loader2} from "lucide-react";
import {formatTime} from "@/lib/helper";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useNotifier} from "@/app/hooks/useNotifications";
import {useApi} from "@/app/hooks/useApi";

export function FieldWorkDisplay({activeSession}) {
    const {notifyError, notifySuccess} = useNotifier();
    const [notes, setNotes] = useState("");
    const [load, setLoad] = useState(false);
    const {apiPatch} = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (notes.trim() === "") {
            notifyError("Opis je obavezan pri izlasku na teren");
            return;
        }
        try {
            const payload = {notes: notes.trim(), time: Date.now()};
            setLoad(true);
            const response = await apiPatch(`/api/fieldwork`, payload);
            if (!response) {
                throw new Error(response.statusText);
            }
            notifySuccess("Uspesna prijava izlaska na teren");
            window.location.reload();
        } catch (err) {
            notifyError("Došlo je do greške pri slanju napomena", err.message);
        } finally {
            setLoad(false);
        }
    };
    return (
        <div className="p-4 bg-muted rounded-lg">
            {activeSession.fieldWork?.fieldNotes?.length > 0 && (
                <div className="mt-4 space-y-2">
                    {activeSession.fieldWork.fieldNotes.map((note, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between gap-4 p-2 rounded-lg bg-background shadow-sm text-sm"
                        >
                        <span className="text-foreground">
                          <span className="font-medium">Napomena:</span> {note.notes}
                        </span>
                                            <span className="text-muted-foreground">
                          {formatTime(new Date(note.time))}
                        </span>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-5">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Input
                            id="fieldworknotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Izlazak/povratak sa terena"
                        />
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            variant="warning"
                            disabled={load}
                        >
                            {load && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            Unesi aktivnost
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
