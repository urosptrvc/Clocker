export const processUserSessions = (user) => {
  return user.clockSessions.map((session) => {
    const clockInAttempt = user.clockAttempts.find((attempt) => attempt.id === session.clockInEventId)
    const clockOutAttempt = user.clockAttempts.find((attempt) => attempt.id === session.clockOutEventId)

    if (!clockInAttempt || !clockOutAttempt) {
      return {
        id: session.id,
        userId: session.userId,
        clockIn: session.createdAt,
        clockOut: session.createdAt,
        durationMinutes: 0,
        regularMinutes: 0,
        overtimeMinutes: 0,
        hourly_rate: user.hourly_rate,
        earningsRegular: 0,
        earningsOvertime: 0,
        createdAt: session.createdAt,
        locationIn: null,
        locationOut: null,
        notesIn: null,
        notesOut: null,
      }
    }

    const durationMinutes = session.durationMinutes

    const regularMinutes = session.regularMinutes
    const overtimeMinutes = session.overtimeMinutes

    // Calculate earnings
    const hourlyRate = Number.parseFloat(user.hourly_rate) || 0
    const earningsRegular = (regularMinutes / 60) * hourlyRate
    const earningsOvertime = (overtimeMinutes / 60) * hourlyRate * 1.5 // 1.5x rate for overtime

    return {
      id: session.id,
      userId: session.userId,
      clockIn: clockInAttempt.timestamp,
      clockOut: clockOutAttempt.timestamp,
      durationMinutes,
      regularMinutes,
      overtimeMinutes,
      hourly_rate: user.hourly_rate,
      earningsRegular: earningsRegular,
      earningsOvertime: earningsOvertime,
      createdAt: session.createdAt,
      locationIn: clockInAttempt.location,
      locationOut: clockOutAttempt.location,
      notesIn: clockInAttempt.notes,
      notesOut: clockOutAttempt.notes,
    }
  })
}

export const getUserStats = (user) => {
  const sessions = processUserSessions(user)
  const totalDuration = sessions.reduce((sum, session) => sum + session.durationMinutes, 0)
  const totalRegularMinutes = sessions.reduce((sum, session) => sum + session.regularMinutes, 0)
  const totalOvertimeMinutes = sessions.reduce((sum, session) => sum + session.overtimeMinutes, 0)
  const totalEarnings = sessions.reduce((sum, session) => sum + session.earningsRegular + session.earningsOvertime, 0)
  const successfulAttempts = user.clockAttempts.filter((attempt) => attempt.success).length
  const failedAttempts = user.clockAttempts.filter((attempt) => !attempt.success).length

  return {
    totalSessions: sessions.length,
    totalDuration,
    totalRegularMinutes,
    totalOvertimeMinutes,
    totalEarnings,
    successfulAttempts,
    failedAttempts,
    averageSession: sessions.length > 0 ? totalDuration / sessions.length : 0,
  }
}

export const getDetailedUserAnalytics = (user) => {
  const sessions = processUserSessions(user)
  const attempts = user.clockAttempts

  // Time-based analysis
  const today = new Date()
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todaySessions = sessions.filter((s) => new Date(s.clockIn) >= new Date(today.toDateString()))
  const weekSessions = sessions.filter((s) => new Date(s.clockIn) >= thisWeek)
  const monthSessions = sessions.filter((s) => new Date(s.clockIn) >= thisMonth)

  // Daily patterns
  const dailyStats: Record<string, { sessions: number; duration: number; earnings: number }> = {}
  sessions.forEach((session) => {
    const day = new Date(session.clockIn).toLocaleDateString("en-US", { weekday: "long" })
    if (!dailyStats[day]) {
      dailyStats[day] = { sessions: 0, duration: 0, earnings: 0 }
    }
    dailyStats[day].sessions++
    dailyStats[day].duration += session.durationMinutes
    dailyStats[day].earnings += session.earningsRegular + session.earningsOvertime
  })

  // Recent activity (last 7 days)
  const recentActivity = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toDateString()
    const daySessions = sessions.filter((s) => new Date(s.clockIn).toDateString() === dateStr)
    const dayDuration = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const dayEarnings = daySessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0)

    recentActivity.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sessions: daySessions.length,
      duration: dayDuration,
      earnings: dayEarnings,
    })
  }

  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalEarnings = sessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0)

  return {
    totalSessions: sessions.length,
    hourly_rate: user.hourly_rate,
    totalDuration,
    totalEarnings,
    averageSession: sessions.length > 0 ? totalDuration / sessions.length : 0,
    todayStats: {
      sessions: todaySessions.length,
      duration: todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      earnings: todaySessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0),
    },
    weekStats: {
      sessions: weekSessions.length,
      duration: weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      earnings: weekSessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0),
    },
    monthStats: {
      sessions: monthSessions.length,
      duration: monthSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      earnings: monthSessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0),
    },
    dailyStats,
    recentActivity,
    successRate: attempts.length > 0 ? (attempts.filter((a) => a.success).length / attempts.length) * 100 : 0,
    mostActiveDay: Object.entries(dailyStats).sort(([, a], [, b]) => b.duration - a.duration)[0]?.[0] || "N/A",
    longestSession: Math.max(...sessions.map((s) => s.durationMinutes), 0),
    shortestSession: sessions.length > 0 ? Math.min(...sessions.map((s) => s.durationMinutes)) : 0,
    totalRegularMinutes: sessions.reduce((sum, s) => sum + s.regularMinutes, 0),
    totalOvertimeMinutes: sessions.reduce((sum, s) => sum + s.overtimeMinutes, 0),
  }
}

export const filterSessionsByDateRange = (sessions, startDate: Date, endDate: Date) => {
  return sessions.filter((session) => {
    const sessionDate = new Date(session.clockIn)
    return sessionDate >= startDate && sessionDate <= endDate
  })
}

export const filterAttemptsByDateRange = (attempts, startDate: Date, endDate: Date) => {
  return attempts.filter((attempt) => {
    const attemptDate = new Date(attempt.timestamp)
    return attemptDate >= startDate && attemptDate <= endDate
  })
}
