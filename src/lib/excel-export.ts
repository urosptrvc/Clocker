import * as XLSX from "xlsx"
import {
  processUserSessions,
  getDetailedUserAnalytics,
  filterSessionsByDateRange,
  filterAttemptsByDateRange,
} from "./data-processing"

export const exportAllUsersToExcel = (users, startDate: Date, endDate: Date) => {
  const workbook = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ["Export Period", `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
    ["Export Date", new Date().toLocaleDateString()],
    ["Total Users", users.length],
    [""],
    ["User", "Email", "Role", "Total Sessions", "Total Duration (Hours)", "Success Rate (%)", "Join Date"],
  ]

  users.forEach((user) => {
    const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
    const filteredAttempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
    const successfulAttempts = filteredAttempts.filter((a) => a.success).length
    const totalAttempts = filteredAttempts.length
    const successRate = totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(1) : 0

    summaryData.push([
      user.name,
      user.email,
      user.role,
      sessions.length,
      (totalDuration / 3600).toFixed(2),
      successRate,
      new Date(user.createdAt).toLocaleDateString(),
    ])
  })

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Detailed sessions sheet
  const sessionsData = [
    ["User Name", "Email", "Date", "Clock In", "Clock Out", "Duration (Hours)", "Duration (Minutes)", "Session ID"],
  ]

  users.forEach((user) => {
    const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
    sessions.forEach((session) => {
      sessionsData.push([
        user.name,
        user.email,
        new Date(session.clockIn).toLocaleDateString(),
        new Date(session.clockIn).toLocaleTimeString(),
        new Date(session.clockOut).toLocaleTimeString(),
        (session.duration / 3600).toFixed(2),
        (session.duration / 60).toFixed(0),
        session.id,
      ])
    })
  })

  const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)
  XLSX.utils.book_append_sheet(workbook, sessionsSheet, "All Sessions")

  // Clock attempts sheet
  const attemptsData = [["User Name", "Email", "Type", "Timestamp", "Date", "Time", "Success", "Attempt ID"]]

  users.forEach((user) => {
    const attempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
    attempts.forEach((attempt) => {
      attemptsData.push([
        user.name,
        user.email,
        attempt.type,
        attempt.timestamp,
        new Date(attempt.timestamp).toLocaleDateString(),
        new Date(attempt.timestamp).toLocaleTimeString(),
        attempt.success ? "Yes" : "No",
        attempt.id,
      ])
    })
  })

  const attemptsSheet = XLSX.utils.aoa_to_sheet(attemptsData)
  XLSX.utils.book_append_sheet(workbook, attemptsSheet, "Clock Attempts")

  // Export file
  const fileName = `All_Users_Report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

export const exportSingleUserToExcel = (user, startDate: Date, endDate: Date) => {
  const workbook = XLSX.utils.book_new()
  const analytics = getDetailedUserAnalytics(user)

  // User info sheet
  const userInfoData = [
    ["User Information"],
    ["Name", user.name],
    ["Email", user.email],
    ["Role", user.role],
    ["Join Date", new Date(user.createdAt).toLocaleDateString()],
    ["Export Period", `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
    ["Export Date", new Date().toLocaleDateString()],
    [""],
    ["Analytics Summary"],
    ["Total Sessions", analytics.totalSessions],
    ["Total Duration (Hours)", (analytics.totalDuration / 3600).toFixed(2)],
    ["Average Session (Minutes)", (analytics.averageSession / 60).toFixed(0)],
    ["Success Rate (%)", analytics.successRate.toFixed(1)],
    ["Most Active Day", analytics.mostActiveDay],
    ["Longest Session (Minutes)", (analytics.longestSession / 60).toFixed(0)],
    ["Shortest Session (Minutes)", (analytics.shortestSession / 60).toFixed(0)],
  ]

  const userInfoSheet = XLSX.utils.aoa_to_sheet(userInfoData)
  XLSX.utils.book_append_sheet(workbook, userInfoSheet, "User Info")

  // Sessions sheet
  const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
  const sessionsData = [
    ["Date", "Clock In", "Clock Out", "Duration (Hours)", "Duration (Minutes)", "Day of Week", "Session ID"],
  ]

  sessions.forEach((session) => {
    const clockInDate = new Date(session.clockIn)
    sessionsData.push([
      clockInDate.toLocaleDateString(),
      clockInDate.toLocaleTimeString(),
      new Date(session.clockOut).toLocaleTimeString(),
      (session.duration / 3600).toFixed(2),
      (session.duration / 60).toFixed(0),
      clockInDate.toLocaleDateString("sr-Latn-RS", { weekday: "long" }),
      session.id,
    ])
  })

  const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)
  XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Sessions")

  // Daily summary sheet
  const dailySummary: Record<string, { sessions: number; duration: number }> = {}
  sessions.forEach((session) => {
    const date = new Date(session.clockIn).toLocaleDateString()
    if (!dailySummary[date]) {
      dailySummary[date] = { sessions: 0, duration: 0 }
    }
    dailySummary[date].sessions++
    dailySummary[date].duration += session.duration
  })

  const dailySummaryData = [["Date", "Day of Week", "Sessions", "Total Duration (Hours)", "Total Duration (Minutes)"]]
  Object.entries(dailySummary).forEach(([date, data]) => {
    const dayOfWeek = new Date(date).toLocaleDateString("sr-Latn-RS", { weekday: "long" })
    dailySummaryData.push([
      date,
      dayOfWeek,
      String(data.sessions),
      (data.duration / 3600).toFixed(2),
      (data.duration / 60).toFixed(0),
    ])
  })

  const dailySummarySheet = XLSX.utils.aoa_to_sheet(dailySummaryData)
  XLSX.utils.book_append_sheet(workbook, dailySummarySheet, "Daily Summary")

  // Clock attempts sheet
  const attempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
  const attemptsData = [["Type", "Timestamp", "Date", "Time", "Success", "Day of Week", "Attempt ID"]]

  attempts.forEach((attempt) => {
    const attemptDate = new Date(attempt.timestamp)
    attemptsData.push([
      attempt.type,
      attempt.timestamp,
      attemptDate.toLocaleDateString(),
      attemptDate.toLocaleTimeString(),
      attempt.success ? "Yes" : "No",
      attemptDate.toLocaleDateString("sr-Latn-RS", { weekday: "long" }),
      attempt.id,
    ])
  })

  const attemptsSheet = XLSX.utils.aoa_to_sheet(attemptsData)
  XLSX.utils.book_append_sheet(workbook, attemptsSheet, "Clock Attempts")

  // Export file
  const fileName = `${user.name.replace(/\s+/g, "_")}_Report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
