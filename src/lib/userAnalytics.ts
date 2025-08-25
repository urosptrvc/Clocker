export function getUserAnalytics(user, dateRange) {
    const fromDate = new Date(dateRange.from)
    const toDate = dateRange.to ? new Date(dateRange.to) : new Date()

    // Set time boundaries
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    // Filter data by date range
    const filteredAttempts = user.clockAttempts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort descending first
        .filter((attempt) => {
            const attemptDate = new Date(attempt.timestamp);
            return attemptDate >= fromDate && attemptDate <= toDate;
        });

    const filteredSessions = user.clockSessions.filter((session) => {
        const sessionDate = new Date(session.createdAt)
        return sessionDate >= fromDate && sessionDate <= toDate
    })

    const hourlyRate = Number.parseFloat(user.hourly_rate || "0")
    const extendedRate = Number.parseFloat(user.extended_rate || "0")

    // Basic calculations
    const totalSessions = filteredSessions.length
    const totalDuration = filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0) * 60
    const totalOvertime = filteredSessions.reduce((sum, s) => sum + s.overtimeMinutes, 0) * 60
    const totalRegular = filteredSessions.reduce((sum, s) => sum + s.regularMinutes, 0) * 60
    const totalAttempts = filteredAttempts.length
    const successfulAttempts = filteredAttempts.filter((a) => a.success).length
    const failedAttempts = totalAttempts - successfulAttempts
    const overallSuccessRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0

    // Earnings calculations
    const regularEarnings = hourlyRate * (totalRegular / 3600)
    const overtimeEarnings = extendedRate * (totalOvertime / 3600)
    const totalEarnings = regularEarnings + overtimeEarnings

    // Calculate working days in period
    const workingDaysInPeriod = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

    // Session analytics
    const sessionDurations = filteredSessions.map((s) => s.durationMinutes * 60)
    const averageSessionDuration =
        sessionDurations.length > 0 ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length : 0
    const longestSession = sessionDurations.length > 0 ? Math.max(...sessionDurations) : 0
    const shortestSession = sessionDurations.length > 0 ? Math.min(...sessionDurations) : 0
    const averageOvertimePerSession = totalSessions > 0 ? totalOvertime / totalSessions : 0
    const overtimePercentage = totalDuration > 0 ? (totalOvertime / totalDuration) * 100 : 0

    // Daily patterns
    const dailyStats = {}
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Initialize daily stats
    days.forEach((day) => {
        dailyStats[day] = {
            sessions: 0,
            duration: 0,
            overtime: 0,
            regular: 0,
            attempts: 0,
            successfulAttempts: 0,
            earnings: 0,
        }
    })

    // Populate daily stats from sessions
    filteredSessions.forEach((session) => {
        const sessionDate = new Date(session.createdAt)
        const dayName = days[sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1]

        dailyStats[dayName].sessions++
        dailyStats[dayName].duration += session.durationMinutes * 60
        dailyStats[dayName].overtime += session.overtimeMinutes * 60
        dailyStats[dayName].regular += session.regularMinutes * 60
        dailyStats[dayName].earnings +=
            hourlyRate * (session.regularMinutes / 60) + extendedRate * 1.5 * (session.overtimeMinutes / 60)
    })

    // Populate daily stats from attempts
    filteredAttempts.forEach((attempt) => {
        const attemptDate = new Date(attempt.timestamp)
        const dayName = days[attemptDate.getDay() === 0 ? 6 : attemptDate.getDay() - 1]

        dailyStats[dayName].attempts++
        if (attempt.success) {
            dailyStats[dayName].successfulAttempts++
        }
    })

    // Find most/least active days
    const mostActiveDay = Object.entries(dailyStats).reduce(
        (max, [day, stats]: any) => (stats.sessions > max.sessions ? {day, sessions: stats.sessions} : max),
        {day: "Monday", sessions: 0},
    ).day

    const leastActiveDay = Object.entries(dailyStats).reduce(
        (min, [day, stats]: any) =>
            stats.sessions < min.sessions && stats.sessions > 0 ? {day, sessions: stats.sessions} : min,
        {day: "Monday", sessions: Number.POSITIVE_INFINITY},
    ).day

    const mostProductiveDay = Object.entries(dailyStats).reduce(
        (max, [day, stats]: any) => (stats.duration > max.duration ? {day, duration: stats.duration} : max),
        {day: "Monday", duration: 0},
    ).day

    // Weekly totals
    const weeklyTotals = {
        sessions: totalSessions,
        duration: totalDuration,
        overtime: totalOvertime,
        earnings: totalEarnings,
        attempts: totalAttempts,
        successRate: overallSuccessRate,
    }

    // Location analytics
    const locationMap = new Map()

    filteredAttempts.forEach((attempt) => {
        const location = attempt.location || "Unknown"
        if (!locationMap.has(location)) {
            locationMap.set(location, {
                location,
                attempts: 0,
                successfulAttempts: 0,
                successRate: 0,
                sessions: 0,
                totalDuration: 0,
            })
        }

        const stats = locationMap.get(location)!
        stats.attempts++
        if (attempt.success) {
            stats.successfulAttempts++
        }
        stats.successRate = (stats.successfulAttempts / stats.attempts) * 100
    })


    // Attempt analytics
    const clockInAttempts = filteredAttempts.filter((a) => a.type === "IN").length
    const clockOutAttempts = filteredAttempts.filter((a) => a.type === "OUT").length
    const clockInSuccessful = filteredAttempts.filter((a) => a.type === "IN" && a.success).length
    const clockOutSuccessful = filteredAttempts.filter((a) => a.type === "OUT" && a.success).length

    const clockInSuccessRate = clockInAttempts > 0 ? (clockInSuccessful / clockInAttempts) * 100 : 0
    const clockOutSuccessRate = clockOutAttempts > 0 ? (clockOutSuccessful / clockOutAttempts) * 100 : 0

    // Hourly distribution
    const hourlyDistribution: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
        hourlyDistribution[i] = 0
    }

    filteredSessions.forEach((session) => {
        const hour = new Date(session.createdAt).getHours()
        hourlyDistribution[hour]++
    })


    // Trends (weekly breakdown if period > 7 days)
    const trends = {
        sessionsPerWeek: [] as number[],
        durationPerWeek: [] as number[],
        successRatePerWeek: [] as number[],
        earningsPerWeek: [] as number[],
    }

    if (workingDaysInPeriod > 7) {
        const weekCount = Math.ceil(workingDaysInPeriod / 7)
        for (let week = 0; week < weekCount; week++) {
            const weekStart = new Date(fromDate.getTime() + week * 7 * 24 * 60 * 60 * 1000)
            const weekEnd = new Date(Math.min(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000, toDate.getTime()))

            const weekSessions = filteredSessions.filter((s) => {
                const sessionDate = new Date(s.createdAt)
                return sessionDate >= weekStart && sessionDate < weekEnd
            })

            const weekAttempts = filteredAttempts.filter((a) => {
                const attemptDate = new Date(a.timestamp)
                return attemptDate >= weekStart && attemptDate < weekEnd
            })

            const weekDuration = weekSessions.reduce((sum, s) => sum + s.durationMinutes * 60, 0)
            const weekSuccessful = weekAttempts.filter((a) => a.success).length
            const weekSuccessRate = weekAttempts.length > 0 ? (weekSuccessful / weekAttempts.length) * 100 : 0
            const weekEarnings = weekSessions.reduce(
                (sum, s) => sum + hourlyRate * (s.regularMinutes / 60) + extendedRate * 1.5 * (s.overtimeMinutes / 60),
                0,
            )

            trends.sessionsPerWeek.push(weekSessions.length)
            trends.durationPerWeek.push(weekDuration)
            trends.successRatePerWeek.push(weekSuccessRate)
            trends.earningsPerWeek.push(weekEarnings)
        }
    }

    // Recent activity (last 7 days within range)
    const recentActivity = []
    const recentDays = Math.min(7, workingDaysInPeriod)

    for (let i = 0; i < recentDays; i++) {
        const dayDate = new Date(toDate.getTime() - i * 24 * 60 * 60 * 1000)
        const dayStart = new Date(dayDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayDate)
        dayEnd.setHours(23, 59, 59, 999)

        const daySessions = filteredSessions.filter((s) => {
            const sessionDate = new Date(s.createdAt)
            return sessionDate >= dayStart && sessionDate <= dayEnd
        })

        const dayAttempts = filteredAttempts.filter((a) => {
            const attemptDate = new Date(a.timestamp)
            return attemptDate >= dayStart && attemptDate <= dayEnd
        })

        const dayDuration = daySessions.reduce((sum, s) => sum + s.durationMinutes * 60, 0)
        const dayOvertime = daySessions.reduce((sum, s) => sum + s.overtimeMinutes * 60, 0)
        const daySuccessful = dayAttempts.filter((a) => a.success).length
        const daySuccessRate = dayAttempts.length > 0 ? (daySuccessful / dayAttempts.length) * 100 : 0
        const dayEarnings = daySessions.reduce(
            (sum, s) => sum + hourlyRate * (s.regularMinutes / 60) + extendedRate * 1.5 * (s.overtimeMinutes / 60),
            0,
        )

        recentActivity.unshift({
            date: dayDate.toISOString().split("T")[0],
            sessions: daySessions.length,
            duration: dayDuration,
            overtime: dayOvertime,
            attempts: dayAttempts.length,
            successRate: daySuccessRate,
            earnings: dayEarnings,
        })
    }


    return {
        // Basic Stats
        totalSessions,
        totalDuration,
        totalOvertime,
        totalRegular,
        totalAttempts,
        successfulAttempts,
        failedAttempts,
        overallSuccessRate,
        filteredAttempts,

        // Earnings
        totalEarnings,
        regularEarnings,
        overtimeEarnings,

        // Session Analytics
        averageSessionDuration,
        longestSession,
        shortestSession,
        averageOvertimePerSession,
        overtimePercentage,

        // Daily Patterns
        dailyStats,
        mostActiveDay,
        leastActiveDay,
        mostProductiveDay,

        // Weekly Summary
        weeklyTotals,

        // Attempt Analytics
        clockInAttempts,
        clockOutAttempts,
        clockInSuccessRate,
        clockOutSuccessRate,

        // Recent Activity
        recentActivity,
    }
}
