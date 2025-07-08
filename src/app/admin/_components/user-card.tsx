"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserIcon, Mail, Shield } from "lucide-react"
import { formatDate, formatDuration } from "@/lib/helper"

export function UserCard({ user, stats, onClick }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {user.name}
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Joined {formatDate(user.createdAt)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{formatDuration(stats.totalDuration)}</div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{formatDuration(stats.averageSession)}</div>
            <div className="text-xs text-muted-foreground">Avg Session</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{stats.successfulAttempts}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">{stats.failedAttempts}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
