import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Clock, Calendar, Timer, CircleDollarSign} from "lucide-react"
import {formatDate, formatDuration, formatSalary, formatTime} from "@/lib/helper"

interface Session {
  id: string
  clockIn: string
  clockOut: string
  duration: number
  hourly_rate: any
}

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  const formattedDate = session.clockIn ? formatDate(session.clockIn) : null;
  const formattedClockIn = session.clockIn ? formatTime(session.clockIn) : null;
  const formattedClockOut = session.clockOut ? formatTime(session.clockOut) : null;

  const salary = (typeof session.duration === "number" && session.hourly_rate)
      ? formatSalary(session.duration, session.hourly_rate)
      : null;

  const duration = typeof session.duration === "number"
      ? formatDuration(session.duration)
      : null;

  return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formattedDate ?? "U procesu"}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Pocetak: {formattedClockIn ?? "U procesu"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Kraj: {formattedClockOut ?? "U procesu"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm font-medium">
                <CircleDollarSign className="h-3 w-3 mr-1" />
                {salary ?? "U procesu"}
              </Badge>
              <Badge variant="secondary" className="text-sm font-medium">
                <Timer className="h-3 w-3 mr-1" />
                {duration ?? "U procesu"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
