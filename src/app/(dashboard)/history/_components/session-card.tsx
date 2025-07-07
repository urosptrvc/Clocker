import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Timer } from "lucide-react"
import { formatDate, formatDuration, formatTime } from "@/lib/helper"

interface Session {
  id: string
  clockIn: string
  clockOut: string
  duration: number
}

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDate(session.clockIn)}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Pocetak: {formatTime(session.clockIn)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Kraj: {formatTime(session.clockOut)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-medium">
              <Timer className="h-3 w-3 mr-1" />
              {formatDuration(session.duration)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
