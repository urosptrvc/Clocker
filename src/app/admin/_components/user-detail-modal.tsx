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
        <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold truncate">{user.name}</span>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="w-fit">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground font-normal truncate">{user.email}</div>
                </div>
              </DialogTitle>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="w-full sm:w-auto">
                  <DatePickerWithRange
                      className="w-full"
                      selected={localDateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setLocalDateRange(range)
                        }
                      }}
                  />
                </div>

                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 w-full sm:w-auto"
                    size="sm"
                >
                  {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span className="hidden sm:inline">Exporting...</span>
                        <span className="sm:hidden">Export...</span>
                      </>
                  ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export User Data</span>
                        <span className="sm:hidden">Export</span>
                      </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-1">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl lg:text-2xl font-bold text-primary">{analytics.totalSessions}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">Total Sessions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl lg:text-2xl font-bold text-primary">
                      {formatDuration(analytics.totalDuration)}
                    </div>
                    <div className="text-xs lg:text-sm text-muted-foreground">Total Time</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl lg:text-2xl font-bold text-primary">{Math.round(analytics.successRate)}%</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">Success Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl lg:text-2xl font-bold text-primary truncate">{analytics.mostActiveDay}</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">Most Active Day</div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Period Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5" />
                    Time Period Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 lg:p-4 border rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">Today</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {analytics.todayStats.sessions} sessions
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.todayStats.duration)}
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 border rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">This Week</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {analytics.weekStats.sessions} sessions
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.weekStats.duration)}
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 border rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">This Month</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {analytics.monthStats.sessions} sessions
                      </div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.monthStats.duration)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Pattern Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Timer className="h-4 w-4 lg:h-5 lg:w-5" />
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
                          <div key={day} className="flex items-center gap-2 lg:gap-4">
                            <div className="w-16 lg:w-20 text-xs lg:text-sm font-medium truncate">{day}</div>
                            <div className="flex-1 bg-secondary rounded-full h-2 lg:h-3">
                              <div
                                  className="bg-primary h-2 lg:h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs lg:text-sm text-muted-foreground w-16 lg:w-24 text-right">
                              {dayData.sessions} sessions
                            </div>
                            <div className="text-xs lg:text-sm text-muted-foreground w-16 lg:w-20 text-right">
                              {formatDuration(dayData.duration)}
                            </div>
                          </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                    Last 7 Days Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 lg:gap-2">
                    {analytics.recentActivity.map((day, index) => (
                        <div
                            key={index}
                            className="text-center p-2 lg:p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="text-xs font-medium text-muted-foreground">{day.date}</div>
                          <div className="text-sm lg:text-lg text-primary font-bold">{day.sessions}</div>
                          <div className="text-xs text-muted-foreground truncate">{formatDuration(day.duration)}</div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Timer className="h-4 w-4 lg:h-5 lg:w-5" />
                    Session Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 lg:p-4 bg-accent rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">Longest Session</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.longestSession)}
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-accent rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">Average Session</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.averageSession)}
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-accent rounded-lg">
                      <div className="text-base lg:text-lg font-semibold">Shortest Session</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">
                        {formatDuration(analytics.shortestSession)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentSessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">{formatDate(session.clockIn)}</div>
                            <div className="text-xs lg:text-sm text-muted-foreground">
                              {formatTime(session.clockIn)} - {formatTime(session.clockOut)}
                            </div>
                          </div>
                          <Badge variant="secondary" className="w-fit">
                            {formatDuration(session.duration)}
                          </Badge>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Clock Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    Recent Clock Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentAttempts.map((attempt) => (
                        <div
                            key={attempt.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors gap-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {attempt.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium">Clock {attempt.type}</div>
                              <div className="text-xs lg:text-sm text-muted-foreground truncate">
                                {formatDate(attempt.timestamp)} at {formatTime(attempt.timestamp)}
                              </div>
                            </div>
                          </div>
                          <Badge variant={attempt.success ? "default" : "destructive"} className="w-fit">
                            {attempt.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}
