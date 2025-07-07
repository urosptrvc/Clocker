import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { formatDuration } from "@/lib/helper"

interface Session {
  id: string
  clockIn: string
  clockOut: string
  duration: number
}

interface SessionSummaryProps {
  sessions: Session[]
  totalDuration: number
  filterDescription: string
  filterBy: string
}

export function SessionSummary({ sessions, totalDuration, filterDescription, filterBy }: SessionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Sazetak - {filterDescription}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{sessions.length}</div>
            <div className="text-sm text-muted-foreground">Ukupno Sesija</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatDuration(totalDuration)}</div>
            <div className="text-sm text-muted-foreground">Ukupno Vremena</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {sessions.length > 0 ? formatDuration(Math.round(totalDuration / sessions.length)) : "0s"}
            </div>
            <div className="text-sm text-muted-foreground">Prosecna Sesija</div>
          </div>
        </div>
        {filterBy === "custom-month" && totalDuration > 0 && (
          <div className="border-t pt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary mb-1">
                Mesecno ukupno: {formatDuration(totalDuration)}
              </div>
              <div className="text-sm text-muted-foreground">
                {filterDescription} • {sessions.length} sesija
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
