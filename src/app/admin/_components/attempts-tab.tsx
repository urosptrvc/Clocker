import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, UserIcon } from "lucide-react"
import { formatDate, formatTime } from "@/lib/helper"

export function AttemptsTab({ users }) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {user.name} - Clock Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.clockAttempts
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {attempt.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          Clock {attempt.type} - {formatDate(attempt.timestamp)}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatTime(attempt.timestamp)}</div>
                      </div>
                    </div>
                    <Badge variant={attempt.success ? "default" : "destructive"}>
                      {attempt.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
