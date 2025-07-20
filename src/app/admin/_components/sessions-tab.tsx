"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Timer, UserIcon } from "lucide-react"
import { formatDate, formatTime, formatDuration } from "@/lib/helper"
import {processUserSessions} from "@/lib/data-processing";

export function SessionsTab({ users }) {
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [filterBy, setFilterBy] = useState<"all" | "today" | "week" | "month">("all")

  const allProcessedSessions = useMemo(() => {
    return users.flatMap((user) => processUserSessions(user))
  }, [users])

  const filteredSessions = useMemo(() => {
    let sessions = allProcessedSessions

    // Filter by user
    if (selectedUser !== "all") {
      sessions = sessions.filter((session) => session.userId === selectedUser)
    }

    // Filter by time period
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (filterBy) {
      case "today":
        sessions = sessions.filter((session) => new Date(session.clockIn) >= today)
        break
      case "week":
        sessions = sessions.filter((session) => new Date(session.clockIn) >= weekAgo)
        break
      case "month":
        sessions = sessions.filter((session) => new Date(session.clockIn) >= monthAgo)
        break
    }

    return sessions.sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
  }, [allProcessedSessions, selectedUser, filterBy])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const user = users.find((u) => u.id === session.userId)
          return (
            <Card key={session.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-muted-foreground">•</span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(session.clockIn)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>In: {formatTime(session.clockIn)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Out: {formatTime(session.clockOut)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm font-medium">
                      <Timer className="h-3 w-3 mr-1" />
                      {formatDuration(session.durationMinutes)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
