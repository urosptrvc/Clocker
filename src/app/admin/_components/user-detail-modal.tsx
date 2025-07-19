"use client"

import {useState} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Download,
  ImageIcon,
  MapPin,
  Shield,
  Timer,
  UserIcon,
  X,
  XCircle,
} from "lucide-react"
import {formatDate, formatDuration, formatTime} from "@/lib/helper"
import {DatePickerWithRange} from "@/components/ui/date-range-picker"
import {getDetailedUserAnalytics, processUserSessions} from "@/lib/data-processing"
import {exportSingleUserToExcel} from "@/lib/excel-export"

export function UserDetailModal({ user, isOpen, onClose, dateRange: globalDateRange }) {
  const [localDateRange, setLocalDateRange] = useState(globalDateRange)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [isAttemptDrawerOpen, setIsAttemptDrawerOpen] = useState(false)

  if (!user) return null

  const analytics = getDetailedUserAnalytics(user)
  const recentSessions = processUserSessions(user)
  const recentAttempts = user.clockAttempts
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

  const handleAttemptClick = (attempt) => {
    setSelectedAttempt(attempt)
    setIsAttemptDrawerOpen(true)
  }

  const getAttemptImages = (attempt) => {
    if (!attempt) return []
    return [
      {
        path: attempt.FrontTruckPath,
        label: "Front Truck",
        alt: "Front view of truck",
      },
      {
        path: attempt.BackTruckPath,
        label: "Back Truck",
        alt: "Back view of truck",
      },
      {
        path: attempt.DashboardPath,
        label: "Dashboard",
        alt: "Dashboard view",
      },
    ].filter((img) => img.path) // Only include images that have paths
  }

  return (
      <>
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
                    <div className="text-sm text-muted-foreground font-normal truncate">{user.username}</div>
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
                      <div className="text-xl lg:text-2xl font-bold text-primary">
                        {Math.round(analytics.successRate)}%
                      </div>
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
                              onClick={() => handleAttemptClick(attempt)}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors gap-2 cursor-pointer"
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
                            <div className="flex items-center gap-2">
                              <Badge variant={attempt.success ? "default" : "destructive"} className="w-fit">
                                {attempt.success ? "Success" : "Failed"}
                              </Badge>
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attempt Details Drawer */}
        <Drawer open={isAttemptDrawerOpen} onOpenChange={setIsAttemptDrawerOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-3">
                  {selectedAttempt?.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Clock {selectedAttempt?.type} Attempt Details
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="p-6 overflow-y-auto">
              {selectedAttempt && (
                  <div className="space-y-6">
                    {/* Attempt Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Attempt Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={selectedAttempt.success ? "default" : "destructive"}>
                              {selectedAttempt.success ? "Success" : "Failed"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">Clock {selectedAttempt.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{formatDate(selectedAttempt.timestamp)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium">{formatTime(selectedAttempt.timestamp)}</span>
                          </div>
                          {selectedAttempt.location && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Location:</span>
                                <span className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                                  {selectedAttempt.location}
                          </span>
                              </div>
                          )}
                          {selectedAttempt.reason && !selectedAttempt.success && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Failure Reason:</span>
                                <span className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedAttempt.reason}</span>
                              </div>
                          )}
                          {selectedAttempt.notes && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Notes:</span>
                                <span className="text-sm bg-muted p-2 rounded">{selectedAttempt.notes}</span>
                              </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Username:</span>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Role:</span>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">User ID:</span>
                            <span className="font-mono text-sm">{user.id}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ImageIcon className="h-5 w-5" />
                          Uploaded Images
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {getAttemptImages(selectedAttempt).map((image, index) => (
                              <div key={index} className="space-y-2">
                                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                  <img
                                      src={image.path || "/placeholder.svg"}
                                      alt={image.alt}
                                      className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">{image.label}</p>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-1 bg-transparent"
                                      onClick={() => window.open(image.path, "_blank")}
                                      disabled={!image.path}
                                  >
                                    View Full Size
                                  </Button>
                                </div>
                              </div>
                          ))}
                        </div>
                        {getAttemptImages(selectedAttempt).length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No images available for this attempt</p>
                            </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Additional Details */}
                    {(selectedAttempt.deviceInfo || selectedAttempt.ipAddress || selectedAttempt.userAgent) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Technical Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedAttempt.deviceInfo && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-muted-foreground">Device Info:</span>
                                  <span className="text-sm font-mono bg-muted p-2 rounded">{selectedAttempt.deviceInfo}</span>
                                </div>
                            )}
                            {selectedAttempt.ipAddress && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">IP Address:</span>
                                  <span className="font-mono text-sm">{selectedAttempt.ipAddress}</span>
                                </div>
                            )}
                            {selectedAttempt.userAgent && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-muted-foreground">User Agent:</span>
                                  <span className="text-xs font-mono bg-muted p-2 rounded break-all">
                            {selectedAttempt.userAgent}
                          </span>
                                </div>
                            )}
                          </CardContent>
                        </Card>
                    )}
                  </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </>
  )
}
