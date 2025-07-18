import * as XLSX from "xlsx"
import {
    processUserSessions,
    getDetailedUserAnalytics,
    filterSessionsByDateRange,
    filterAttemptsByDateRange,
} from "./data-processing"
import {formatSalary} from "@/lib/helper";

export const exportAllUsersToExcel = (users, startDate: Date, endDate: Date) => {
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
        ["Period Izveštaja", `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
        ["Datum Izveštaja", new Date().toLocaleDateString()],
        ["Ukupno Korisnika", users.length],
        [""],
        ["Korisnik", "Username", "Uloga", "Ukupno Sesija", "Ukupno Trajanje (Sati)","Ukupna zarada","Procenat Uspeha (%)", "Datum Pridruživanja"],
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
            user.username,
            user.role,
            sessions.length,
            (totalDuration / 3600).toFixed(2),
            formatSalary(totalDuration,user.hourly_rate),
            successRate,
            new Date(user.createdAt).toLocaleDateString(),
        ])
    })

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Pregled")

    // Detailed sessions sheet
    const sessionsData = [
        ["Ime Korisnika", "Email", "Datum", "Vreme Dolaska", "Vreme Odlaska", "Trajanje (Sati)", "Trajanje (Minuti)", "ID Sesije"],
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
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Sve Sessions")

    // // Clock attempts sheet
    // const attemptsData = [["User Name", "Email", "Type", "Timestamp", "Date", "Time", "Success", "Attempt ID"]]
    //
    // users.forEach((user) => {
    //     const attempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
    //     attempts.forEach((attempt) => {
    //         attemptsData.push([
    //             user.name,
    //             user.email,
    //             attempt.type,
    //             attempt.timestamp,
    //             new Date(attempt.timestamp).toLocaleDateString(),
    //             new Date(attempt.timestamp).toLocaleTimeString(),
    //             attempt.success ? "Yes" : "No",
    //             attempt.id,
    //         ])
    //     })
    // })
    //
    // const attemptsSheet = XLSX.utils.aoa_to_sheet(attemptsData)
    // XLSX.utils.book_append_sheet(workbook, attemptsSheet, "Clock Attempts")

    // Export file
    const fileName = `All_Users_Report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
}

export const exportSingleUserToExcel = (user, startDate: Date, endDate: Date) => {
    const workbook = XLSX.utils.book_new()
    const analytics = getDetailedUserAnalytics(user)

    // User info sheet
    const userInfoData = [
        ["Korisničke Informacije"],
        ["Ime", user.name],
        ["Korisničko ime", user.username],
        ["Uloga", user.role],
        ["Datum Pridruživanja", new Date(user.createdAt).toLocaleDateString()],
        ["Period Izvoza", `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
        ["Datum Izvoza", new Date().toLocaleDateString()],
        [""],
        ["Rezime Analitike"],
        ["Ukupno Sesija", analytics.totalSessions],
        ["Ukupno Trajanje (Sati)", (analytics.totalDuration / 3600).toFixed(2)],
        ["Ukupna Zarada", formatSalary(analytics.totalDuration, analytics.hourly_rate)],
        ["Prosečna Sesija (Minuta)", (analytics.averageSession / 60).toFixed(0)],
        ["Procenat Uspeha (%)", analytics.successRate.toFixed(1)],
        ["Najaktivniji Dan", analytics.mostActiveDay],
        ["Najduža Sesija (Minuta)", (analytics.longestSession / 60).toFixed(0)],
        ["Najkraća Sesija (Minuta)", (analytics.shortestSession / 60).toFixed(0)],
    ]


    const userInfoSheet = XLSX.utils.aoa_to_sheet(userInfoData)
    XLSX.utils.book_append_sheet(workbook, userInfoSheet, "Glavne Informacije")

    // Sessions sheet
    const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
    const sessionsData = [
        ["Datum", "Početak","Početna Lokacija","Početni dopis", "Kraj","Krajnja Lokacija","Krajnji dopis","Trajanje (Sati)", "Trajanje (Minuta)", "Dan u Nedelji", "ID Sesije"],
    ]

    sessions.forEach((session) => {
        const clockInDate = new Date(session.clockIn)
        sessionsData.push([
            clockInDate.toLocaleDateString(),
            clockInDate.toLocaleTimeString(),
            session.clockInLocation,
            session.clockInNotes,
            new Date(session.clockOut).toLocaleTimeString(),
            session.clockOutLocation,
            session.clockOutNotes,
            (session.duration / 3600).toFixed(2),
            (session.duration / 60).toFixed(0),
            clockInDate.toLocaleDateString("sr-Latn-RS", {weekday: "long"}),
            session.id,
        ])
    })

    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Sesije")

    // Daily summary sheet
    const dailySummary: Record<string, { sessions: number; duration: number }> = {}
    sessions.forEach((session) => {
        const date = new Date(session.clockIn).toLocaleDateString()
        if (!dailySummary[date]) {
            dailySummary[date] = {sessions: 0, duration: 0}
        }
        dailySummary[date].sessions++
        dailySummary[date].duration += session.duration
    })

    const dailySummaryData = [
        ["Datum", "Dan u Nedelji", "Sesije", "Ukupno Trajanje (Sati)", "Ukupno Trajanje (Minuta)"]
    ]

    Object.entries(dailySummary).forEach(([date, data]) => {
        const dayOfWeek = new Date(date).toLocaleDateString("sr-Latn-RS", {weekday: "long"})
        dailySummaryData.push([
            date,
            dayOfWeek,
            String(data.sessions),
            (data.duration / 3600).toFixed(2),
            (data.duration / 60).toFixed(0),
        ])
    })

    const dailySummarySheet = XLSX.utils.aoa_to_sheet(dailySummaryData)
    XLSX.utils.book_append_sheet(workbook, dailySummarySheet, "Presek po danu")

    // Clock attempts sheet
    const attempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
    const attemptsData = [
        ["Tip", "Vreme Zapisa", "Datum", "Vreme", "Uspeh", "Dan u Nedelji","Lokacija","Zapis","ID Pokušaja"]
    ]

    attempts.forEach((attempt) => {
        const attemptDate = new Date(attempt.timestamp)
        attemptsData.push([
            attempt.type,
            attempt.timestamp,
            attemptDate.toLocaleDateString(),
            attemptDate.toLocaleTimeString(),
            attempt.success ? "Yes" : "No",
            attemptDate.toLocaleDateString("sr-Latn-RS", {weekday: "long"}),
            attempt.location,
            attempt.notes,
            attempt.id,
        ])
    })

    const attemptsSheet = XLSX.utils.aoa_to_sheet(attemptsData)
    XLSX.utils.book_append_sheet(workbook, attemptsSheet, "Pokusaji Prijave")

    // Export file
    const fileName = `${user.name.replace(/\s+/g, "_")}_Report_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
}
