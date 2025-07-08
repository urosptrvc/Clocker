"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserIcon, Mail, Shield, Clock, Timer, CheckCircle, XCircle } from "lucide-react"
import { formatDate, formatDuration } from "@/lib/helper"

export function UserCard({ user, stats, onClick }) {
  return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]" onClick={onClick}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <CardTitle className="text-lg font-semibold truncate">{user.name}</CardTitle>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Mobile Layout - Simplified */}
          <div className="block sm:hidden space-y-4">
            {/* Primary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Total Time</span>
                </div>
                <div className="text-2xl font-bold text-primary">{formatDuration(stats.totalDuration)}</div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="flex items-center justify-between py-3 px-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">{stats.successfulAttempts}</div>
                <div className="text-xs text-muted-foreground">successful</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Failed Attempts</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">{stats.failedAttempts}</div>
                <div className="text-xs text-muted-foreground">failed</div>
              </div>
            </div>

            {/* Average Session */}
            <div className="text-center py-2">
              <div className="text-sm text-muted-foreground">Average Session</div>
              <div className="text-lg font-semibold text-primary">{formatDuration(stats.averageSession)}</div>
            </div>
          </div>

          {/* Desktop Layout - Original 5 Column Grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-5 gap-4">
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
