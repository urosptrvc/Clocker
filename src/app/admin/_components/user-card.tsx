"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserIcon, Shield, Clock, Timer, CheckCircle, DollarSign, Zap } from "lucide-react"
import { formatDate, formatDuration } from "@/lib/helper"

interface UserCardProps {
  user: {
    id: string
    name: string
    username: string
    role: string
    createdAt: string
    hourly_rate: string
    extended_rate: string
  }
  stats: {
    totalSessions: number
    totalDuration: number
    totalRegularMinutes: number
    totalOvertimeMinutes: number
    totalEarnings: number
    successfulAttempts: number
    failedAttempts: number
    averageSession: number
  }
  onClickAction: () => void
}

export function UserCard({ user, stats, onClickAction }: UserCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const overtimePercentage =
      stats.totalDuration > 0 ? Math.round((stats.totalOvertimeMinutes / stats.totalDuration) * 100) : 0

  return (
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]" onClick={onClickAction}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {user.name
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase())
                  .join('')
                  .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <CardTitle className="text-lg font-semibold truncate">{user.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="w-fit">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="w-fit text-xs">
                    {formatCurrency(Number.parseFloat(user.hourly_rate || "0"))}/h
                  </Badge>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {formatCurrency(Number.parseFloat(user.extended_rate || "0"))}/h
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <UserIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.username}</span>
              </div>
              <div className="text-xs text-muted-foreground">Dodat {formatDate(user.createdAt)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Mobile Layout - Enhanced with earnings */}
          <div className="block sm:hidden space-y-4">
            {/* Primary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Sesije</span>
                </div>
                <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Zarada</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
              </div>
            </div>

            {/* Time Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">Regularno</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{formatDuration(stats.totalRegularMinutes)}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Prekovremeno</span>
                </div>
                <div className="text-lg font-bold text-orange-600">{formatDuration(stats.totalOvertimeMinutes)}</div>
              </div>
            </div>

            {/* Success/Failure Stats */}
            <div className="flex items-center justify-between py-3 px-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Uspešno / Neuspešno</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  <span className="text-green-600">{stats.successfulAttempts}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-red-600">{stats.failedAttempts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Enhanced 6 Column Grid */}
          <div className="hidden sm:block">
            {/* Top Row - Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">{stats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sesije</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">{formatDuration(stats.totalDuration)}</div>
                <div className="text-xs text-muted-foreground">Ukupno Vremena</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
                <div className="text-xs text-muted-foreground">Ukupna Zarada</div>
              </div>
            </div>

            {/* Bottom Row - Detailed Breakdown */}
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600">{formatDuration(stats.totalRegularMinutes)}</div>
                  <div className="text-xs text-muted-foreground">Regularno</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-orange-600">
                    {formatDuration(stats.totalOvertimeMinutes)}
                    {overtimePercentage > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({overtimePercentage}%)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Prekovremeno</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">{stats.successfulAttempts}</div>
                  <div className="text-xs text-muted-foreground">Uspešno</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-red-600">{stats.failedAttempts}</div>
                  <div className="text-xs text-muted-foreground">Neuspešno</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
