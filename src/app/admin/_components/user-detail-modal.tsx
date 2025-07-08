"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserIcon, Shield, Calendar, Timer, Clock, CheckCircle, XCircle, Download } from "lucide-react"
import { formatDate, formatDuration, formatTime } from "@/lib/helper"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {getDetailedUserAnalytics, processUserSessions} from "@/lib/data-processing";
import {exportSingleUserToExcel} from "@/lib/excel-export";

export function UserDetailModal({ user, isOpen, onClose, dateRange: globalDateRange }) {
  const [localDateRange, setLocalDateRange] = useState(globalDateRange)
  const [isExporting, setIsExporting] = useState(false)

  if (!user) return null

  const analytics = getDetailedUserAnalytics(user)
  const sessions = processUserSessions(user)
  const recentSessions = sessions.slice(0, 10)
  const recentAttempts = user.clockAttempts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportSingleUserToExcel(user, localDateRange.from, localDateRange.to)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {user.name}
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
                </div>
              </DialogTitle>

              <div className="flex flex-col gap-3">
                <DatePickerWithRange
                    selected={localDateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setLocalDateRange(range)
                      }
                    }}
                />

                <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2" size="sm">
                  {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Exporting...
                      </>
                  ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export User Data
                      </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{analytics.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{formatDuration(analytics.totalDuration)}</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{Math.round(analytics.successRate)}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{analytics.mostActiveDay}</div>
                  <div className="text-sm text-muted-foreground">Most Active Day</div>
                </CardContent>
              </Card>
            </div>

            {/* Time Period Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Time Period Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">Today</div>
                    <div className="text-sm text-muted-foreground">{analytics.todayStats.sessions} sessions</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.todayStats.duration)}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">This Week</div>
                    <div className="text-sm text-muted-foreground">{analytics.weekStats.sessions} sessions</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.weekStats.duration)}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">This Month</div>
                    <div className="text-sm text-muted-foreground">{analytics.monthStats.sessions} sessions</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.monthStats.duration)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Pattern Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Weekly Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const dayData = analytics.dailyStats[day] || { sessions: 0, duration: 0 }
                    const maxDuration = Math.max(...Object.values(analytics.dailyStats).map((d) => d.duration), 1)
                    const percentage = (dayData.duration / maxDuration) * 100

                    return (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-20 text-sm font-medium">{day}</div>
                          <div className="flex-1 bg-secondary rounded-full h-3">
                            <div
                                className="bg-primary h-3 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-sm text-muted-foreground w-24">{dayData.sessions} sessions</div>
                          <div className="text-sm text-muted-foreground w-20">{formatDuration(dayData.duration)}</div>
                        </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Last 7 Days Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {analytics.recentActivity.map((day, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="text-xs font-medium text-muted-foreground">{day.date}</div>
                        <div className="text-lg text-primary font-bold">{day.sessions}</div>
                        <div className="text-xs text-muted-foreground">{formatDuration(day.duration)}</div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Session Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-lg font-semibold">Longest Session</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.longestSession)}</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-lg font-semibold">Average Session</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.averageSession)}</div>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-lg font-semibold">Shortest Session</div>
                    <div className="text-sm text-muted-foreground">{formatDuration(analytics.shortestSession)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentSessions.map((session) => (
                      <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div>
                          <div className="font-medium">{formatDate(session.clockIn)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(session.clockIn)} - {formatTime(session.clockOut)}
                          </div>
                        </div>
                        <Badge variant="secondary">{formatDuration(session.duration)}</Badge>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Clock Attempts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recent Clock Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentAttempts.map((attempt) => (
                      <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {attempt.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">Clock {attempt.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(attempt.timestamp)} at {formatTime(attempt.timestamp)}
                            </div>
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
          </div>
        </DialogContent>
      </Dialog>
  )
}
