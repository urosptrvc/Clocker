import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Timer, CircleDollarSign, MapPin, FileText, Zap } from "lucide-react"
import { formatDate, formatDuration, formatTime } from "@/lib/helper"

interface SessionCardProps {
  session: {
    id: string
    clockIn: string
    clockOut: string
    locationIn?: string
    locationOut?: string
    notesIn?: string
    notesOut?: string
    durationMinutes: number
    regularMinutes: number
    overtimeMinutes: number
    hourly_rate: string
    earningsRegular: number
    earningsOvertime: number
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const formattedDate = session.clockIn ? formatDate(session.clockIn) : null
  const formattedClockIn = session.clockIn ? formatTime(session.clockIn) : null
  const formattedClockOut = session.clockOut ? formatTime(session.clockOut) : null

  const totalEarnings = session.earningsRegular + session.earningsOvertime
  const hasOvertime = session.overtimeMinutes > 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const duration = typeof session.durationMinutes === "number" ? formatDuration(session.durationMinutes) : null

  return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Header with date and time */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formattedDate ?? "U procesu"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Početak: {formattedClockIn ?? "U procesu"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Kraj: {formattedClockOut ?? "U procesu"}</span>
                  </div>
                </div>
              </div>

              {/* Main badges */}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm font-medium">
                  <CircleDollarSign className="h-3 w-3 mr-1" />
                  {formatCurrency(totalEarnings)}
                </Badge>
                <Badge variant="secondary" className="text-sm font-medium">
                  <Timer className="h-3 w-3 mr-1" />
                  {duration ?? "U procesu"}
                </Badge>
              </div>
            </div>

            {/* Time breakdown */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Timer className="h-3 w-3 mr-1 text-blue-500" />
                Regularno: {formatDuration(session.regularMinutes)}
              </Badge>
              {hasOvertime && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1 text-orange-500" />
                    Prekovremeno: {formatDuration(session.overtimeMinutes)}
                  </Badge>
              )}
            </div>

            {/* Earnings breakdown */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <CircleDollarSign className="h-3 w-3 mr-1 text-green-500" />
                Regularna zarada: {formatCurrency(session.earningsRegular)}
              </Badge>
              {session.earningsOvertime > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <CircleDollarSign className="h-3 w-3 mr-1 text-purple-500" />
                    Prekovremena zarada: {formatCurrency(session.earningsOvertime)}
                  </Badge>
              )}
            </div>

            {/* Location and notes */}
            {(session.locationIn || session.locationOut || session.notesIn || session.notesOut) && (
                <div className="border-t pt-3 space-y-2">
                  {(session.locationIn || session.locationOut) && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          {session.locationIn && (
                              <span className="text-muted-foreground">
                        Početak: <span className="text-foreground">{session.locationIn}</span>
                      </span>
                          )}
                          {session.locationIn && session.locationOut && " • "}
                          {session.locationOut && (
                              <span className="text-muted-foreground">
                        Kraj: <span className="text-foreground">{session.locationOut}</span>
                      </span>
                          )}
                        </div>
                      </div>
                  )}

                  {(session.notesIn || session.notesOut) && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          {session.notesIn && (
                              <div className="text-muted-foreground">
                                Početak: <span className="text-foreground">{session.notesIn}</span>
                              </div>
                          )}
                          {session.notesOut && (
                              <div className="text-muted-foreground">
                                Kraj: <span className="text-foreground">{session.notesOut}</span>
                              </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
  )
}
