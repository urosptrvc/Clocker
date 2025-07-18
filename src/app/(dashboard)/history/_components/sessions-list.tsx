import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { SessionCard } from "./session-card"

interface Session {
  id: string
  clockIn: string
  clockOut: string
  duration: number
}

interface SessionsListProps {
  sessions: Session[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nema sesija</h3>
            <p className="text-muted-foreground">Nijedna radna sesija ne odgovara vašim trenutnim kriterijumima filtera.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}
