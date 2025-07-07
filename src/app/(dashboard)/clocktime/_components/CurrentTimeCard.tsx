import { Card, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { formatDate, formatTime } from "@/lib/helper";

export function CurrentTimeCard({ currentTime }) {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5"/>
                    Trenutno vreme
                </CardTitle>
                <CardDescription className="text-2xl font-mono">
                    {formatTime(currentTime)}
                </CardDescription>
                <p className="text-sm text-muted-foreground">
                    {formatDate(currentTime)}
                </p>
            </CardHeader>
        </Card>
    );
}