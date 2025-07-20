import * as XLSX from "xlsx"
import {
    processUserSessions,
    getDetailedUserAnalytics,
    filterSessionsByDateRange,
    filterAttemptsByDateRange,
} from "./data-processing"
import {formatDuration} from "@/lib/helper";

// Enhanced styling utilities
const createStyledWorkbook = () => {
    const workbook = XLSX.utils.book_new()

    // Define custom styles
    const styles = {
        header: {
            font: { bold: true, color: { rgb: "FFFFFF" }, size: 14 },
            fill: { fgColor: { rgb: "2563EB" } }, // Blue
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        },
        subHeader: {
            font: { bold: true, color: { rgb: "1F2937" }, size: 12 },
            fill: { fgColor: { rgb: "E5E7EB" } }, // Light gray
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "9CA3AF" } },
                bottom: { style: "thin", color: { rgb: "9CA3AF" } },
                left: { style: "thin", color: { rgb: "9CA3AF" } },
                right: { style: "thin", color: { rgb: "9CA3AF" } },
            },
        },
        title: {
            font: { bold: true, color: { rgb: "1F2937" }, size: 16 },
            fill: { fgColor: { rgb: "F3F4F6" } },
            alignment: { horizontal: "center", vertical: "center" },
        },
        currency: {
            font: { color: { rgb: "059669" }, bold: true }, // Green
            numFmt: "#,##0 ₽",
            alignment: { horizontal: "right" },
        },
        percentage: {
            font: { color: { rgb: "DC2626" } }, // Red
            numFmt: "0.0%",
            alignment: { horizontal: "center" },
        },
        time: {
            font: { color: { rgb: "7C3AED" } }, // Purple
            alignment: { horizontal: "center" },
        },
        success: {
            font: { color: { rgb: "059669" }, bold: true }, // Green
            alignment: { horizontal: "center" },
        },
        warning: {
            font: { color: { rgb: "D97706" }, bold: true }, // Orange
            alignment: { horizontal: "center" },
        },
        error: {
            font: { color: { rgb: "DC2626" }, bold: true }, // Red
            alignment: { horizontal: "center" },
        },
    }

    return { workbook, styles }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sr-RS", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

const setColumnWidths = (worksheet: XLSX.WorkSheet, widths: number[]) => {
    const cols = widths.map((width) => ({ wch: width }))
    worksheet["!cols"] = cols
}


export const exportAllUsersToExcel = (users, startDate: Date, endDate: Date) => {
    const { workbook } = createStyledWorkbook()

    // ===== EXECUTIVE SUMMARY SHEET =====
    const summaryData = [
        ["📊 IZVEŠTAJ O RADNIM SESIJAMA - SVEOBUHVATAN PREGLED", "", "", "", "", "", "", "", "", "", "", "", ""],
        [""],
        ["📅 Period izveštaja:", `${startDate.toLocaleDateString("sr-RS")} - ${endDate.toLocaleDateString("sr-RS")}`],
        ["📅 Datum kreiranja:", new Date().toLocaleDateString("sr-RS")],
        ["👥 Ukupno korisnika:", users.length],
        [""],
        ["💼 PREGLED PO KORISNICIMA", "", "", "", "", "", "", "", "", "", "", "", ""],
        [""],
        [
            "👤 Korisnik",
            "📧 Username",
            "🛡️ Uloga",
            "💰 Satnica (RSD)",
            "📊 Sesije",
            "⏱️ Ukupno (h)",
            "🕐 Regularno (h)",
            "⚡ Prekovremeno (h)",
            "💵 Reg. zarada",
            "💎 Prek. zarada",
            "💰 UKUPNO",
            "✅ Uspeh (%)",
            "📅 Pridružen",
        ],
    ]

    let totalUsers = 0
    let totalSessions = 0
    let totalHours = 0
    let totalEarnings = 0
    let totalOvertimeHours = 0

    users.forEach((user) => {
        const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
        const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
        const totalRegularMinutes = sessions.reduce((sum, s) => sum + s.regularMinutes, 0)
        const totalOvertimeMinutes = sessions.reduce((sum, s) => sum + s.overtimeMinutes, 0)
        const totalEarningsRegular = sessions.reduce((sum, s) => sum + s.earningsRegular, 0)
        const totalEarningsOvertime = sessions.reduce((sum, s) => sum + s.earningsOvertime, 0)
        const sessionTotalEarnings = totalEarningsRegular + totalEarningsOvertime

        const filteredAttempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
        const successfulAttempts = filteredAttempts.filter((a) => a.success).length
        const totalAttempts = filteredAttempts.length
        const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0

        // Accumulate totals
        totalUsers++
        totalSessions += sessions.length
        totalHours += totalDuration
        totalEarnings += sessionTotalEarnings
        totalOvertimeHours += totalOvertimeMinutes

        summaryData.push([
            user.name,
            user.username,
            user.role === "admin" ? "👑 Admin" : `👤 ${user.role}`,
            `${formatCurrency(Number.parseFloat(user.hourly_rate || "0"))} RSD`,
            sessions.length,
            (formatDuration(totalDuration)),
            (formatDuration(totalRegularMinutes)),
            (formatDuration(totalOvertimeMinutes)),
            `${formatCurrency(totalEarningsRegular)} RSD`,
            `${formatCurrency(totalEarningsOvertime)} RSD`,
            `${formatCurrency(sessionTotalEarnings)} RSD`,
            `${successRate.toFixed(1)}%`,
            new Date(user.createdAt).toLocaleDateString("sr-RS"),
        ])
    })

    // Add totals row
    summaryData.push([""])
    summaryData.push([
        "🎯 UKUPNO:",
        "",
        "",
        "",
        totalSessions,
        formatDuration(totalHours),
        formatDuration(totalHours - totalOvertimeHours),
        formatDuration(totalOvertimeHours),
        "",
        "",
        `${formatCurrency(totalEarnings)} RSD`,
        "",
        "",
    ])

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths for summary
    setColumnWidths(summarySheet, [20, 15, 12, 15, 10, 12, 12, 12, 15, 15, 18, 12, 15])

    // Merge title cell
    summarySheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 12 } },
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, "📊 Pregled")

    // ===== DETAILED SESSIONS SHEET =====
    const sessionsData = [
        ["🔍 DETALJNE RADNE SESIJE", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        [""],
        [
            "👤 Ime",
            "📧 Username",
            "📅 Datum",
            "🕐 Početak",
            "🕕 Kraj",
            "⏱️ Ukupno (h)",
            "⏱️ Ukupno (min)",
            "🕐 Regularno",
            "⚡ Prekovremeno",
            "📍 Lok. dolaska",
            "📍 Lok. odlaska",
            "📝 Napomena in",
            "📝 Napomena out",
            "💵 Reg. zarada",
            "💎 Prek. zarada",
            "💰 UKUPNO",
            "🆔 ID",
        ],
    ]

    users.forEach((user) => {
        const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
        sessions.forEach((session) => {
            const totalEarnings = session.earningsRegular + session.earningsOvertime
            const clockInDate = new Date(session.clockIn)
            const clockOutDate = new Date(session.clockOut)

            sessionsData.push([
                user.name,
                user.username,
                clockInDate.toLocaleDateString("sr-RS"),
                clockInDate.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
                clockOutDate.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
                (session.durationMinutes / 60).toFixed(2),
                session.durationMinutes,
                session.regularMinutes,
                session.overtimeMinutes,
                session.locationIn || "—",
                session.locationOut || "—",
                session.notesIn || "—",
                session.notesOut || "—",
                `${formatCurrency(session.earningsRegular)} RSD`,
                `${formatCurrency(session.earningsOvertime)} RSD`,
                `${formatCurrency(totalEarnings)} RSD`,
                session.id.substring(0, 8) + "...",
            ])
        })
    })

    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)

    // Set column widths for sessions
    setColumnWidths(sessionsSheet, [18, 15, 12, 10, 10, 10, 10, 10, 12, 15, 15, 20, 20, 15, 15, 18, 15])

    // Merge title
    sessionsSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }]

    XLSX.utils.book_append_sheet(workbook, sessionsSheet, "🔍 Detaljne sesije")

    // ===== ANALYTICS DASHBOARD SHEET =====
    const analyticsData = [
        [`📈 ANALITIČKI DASHBOARD`, "", "", "", "", "", "", ""],
        [""],
        ["🎯 KLJUČNI POKAZATELJI PERFORMANSI (KPI)", "", "", "", "", "", "", ""],
        [""],
        ["📊 Metrika", "📈 Vrednost", "📊 Metrika", "📈 Vrednost"],
        ["👥 Ukupno korisnika", totalUsers, "📊 Ukupno sesija", totalSessions],
        ["⏱️ Ukupno sati rada", totalHours.toFixed(1), "💰 Ukupna zarada", `${formatCurrency(totalEarnings)} RSD`],
        [
            "⚡ Prekovremeni sati",
            totalOvertimeHours.toFixed(1),
            "📊 Prosečno po korisniku",
            `${formatCurrency(totalEarnings / totalUsers)} RSD`,
        ],
        [
            "🕐 Prosečno po sesiji",
            `${(totalHours / totalSessions).toFixed(1)}h`,
            "⚡ % prekovremenog",
            `${((totalOvertimeHours / totalHours) * 100).toFixed(1)}%`,
        ],
        [""],
        ["🏆 TOP PERFORMERI", "", "", "", "", "", "", ""],
        [""],
        ["🥇 Rang", "👤 Korisnik", "💰 Zarada", "⏱️ Sati", "📊 Sesije", "⚡ Prekovremeno", "✅ Uspeh", "🎯 Efikasnost"],
    ]

    // Calculate top performers
    const userPerformance = users
        .map((user) => {
            const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
            const totalDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
            const totalOvertimeMinutes = sessions.reduce((sum, s) => sum + s.overtimeMinutes, 0)
            const totalEarningsUser = sessions.reduce((sum, s) => sum + s.earningsRegular + s.earningsOvertime, 0)

            const filteredAttempts = filterAttemptsByDateRange(user.clockAttempts, startDate, endDate)
            const successRate =
                filteredAttempts.length > 0
                    ? (filteredAttempts.filter((a) => a.success).length / filteredAttempts.length) * 100
                    : 0

            return {
                name: user.name,
                earnings: totalEarningsUser,
                hours: totalDuration / 60,
                sessions: sessions.length,
                overtime: totalOvertimeMinutes / 60,
                successRate,
                efficiency: sessions.length > 0 ? totalEarningsUser / sessions.length : 0,
            }
        })
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10)

    userPerformance.forEach((user, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`
        analyticsData.push([
            medal,
            user.name,
            `${formatCurrency(user.earnings)} RSD`,
            `${user.hours.toFixed(1)}h`,
            user.sessions,
            `${user.overtime.toFixed(1)}h`,
            `${user.successRate.toFixed(1)}%`,
            `${formatCurrency(user.efficiency)} RSD/sesija`,
        ])
    })

    const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData)

    // Set column widths for analytics
    setColumnWidths(analyticsSheet, [12, 20, 18, 12, 10, 15, 12, 20])

    // Merge titles
    analyticsSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        { s: { r: 10, c: 0 }, e: { r: 10, c: 7 } },
    ]

    XLSX.utils.book_append_sheet(workbook, analyticsSheet, "📈 Analytics")

    // Export with enhanced filename
    const fileName = `🏢_Radni_Izvestaj_${startDate.toISOString().split("T")[0]}_do_${endDate.toISOString().split("T")[0]}_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
}

export const exportSingleUserToExcel = (user, startDate: Date, endDate: Date) => {
    const { workbook } = createStyledWorkbook()
    const analytics = getDetailedUserAnalytics(user)

    // ===== USER PROFILE SHEET =====
    const userInfoData = [
        [`👤 PROFIL KORISNIKA: ${user.name.toUpperCase()}`, "", "", ""],
        [""],
        ["📋 OSNOVNE INFORMACIJE", "", "", ""],
        [""],
        ["🏷️ Polje", "📊 Vrednost", "🏷️ Polje", "📊 Vrednost"],
        ["👤 Ime i prezime", user.name, "📧 Korisničko ime", user.username],
        [
            "🛡️ Uloga",
            user.role === "admin" ? "👑 Administrator" : "👤 Korisnik",
            "💰 Satnica",
            `${formatCurrency(Number.parseFloat(user.hourly_rate || "0"))} RSD`,
        ],
        [
            "📅 Datum pridruživanja",
            new Date(user.createdAt).toLocaleDateString("sr-RS"),
            "📊 Period analize",
            `${startDate.toLocaleDateString("sr-RS")} - ${endDate.toLocaleDateString("sr-RS")}`,
        ],
        ["📅 Datum izvoza", new Date().toLocaleDateString("sr-RS"), "", ""],
        [""],
        ["📈 STATISTIKE PERFORMANSI", "", "", ""],
        [""],
        ["📊 Metrika", "📈 Vrednost", "📊 Metrika", "📈 Vrednost"],
        ["📊 Ukupno sesija", analytics.totalSessions, "⏱️ Ukupno sati", `${(analytics.totalDuration / 60).toFixed(1)}h`],
        [
            "🕐 Regularno vreme",
            `${(analytics.totalRegularMinutes / 60).toFixed(1)}h`,
            "⚡ Prekovremeno",
            `${(analytics.totalOvertimeMinutes / 60).toFixed(1)}h`,
        ],
        [
            "💰 Ukupna zarada",
            `${formatCurrency(analytics.totalEarnings)} RSD`,
            "📊 Prosečna sesija",
            `${analytics.averageSession.toFixed(0)} min`,
        ],
        ["✅ Procenat uspeha", `${analytics.successRate.toFixed(1)}%`, "🏆 Najaktivniji dan", analytics.mostActiveDay],
        ["⏱️ Najduža sesija", `${analytics.longestSession} min`, "⏱️ Najkraća sesija", `${analytics.shortestSession} min`],
        [""],
        ["🎯 OCENA PERFORMANSI", "", "", ""],
        [""],
    ]

    // Performance rating
    const performanceScore =
        analytics.successRate * 0.4 +
        (analytics.totalSessions / 30) * 20 * 0.3 +
        (analytics.totalEarnings / 100000) * 100 * 0.3

    const rating =
        performanceScore >= 80
            ? "🌟 Odličan"
            : performanceScore >= 60
                ? "👍 Dobar"
                : performanceScore >= 40
                    ? "⚠️ Prosečan"
                    : "❌ Potrebno poboljšanje"

    userInfoData.push(["🎯 Ukupna ocena", `${performanceScore.toFixed(1)}/100`, "🏆 Rang", rating])

    const userInfoSheet = XLSX.utils.aoa_to_sheet(userInfoData)

    // Set column widths
    setColumnWidths(userInfoSheet, [25, 20, 25, 20])

    // Merge titles
    userInfoSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } },
        { s: { r: 18, c: 0 }, e: { r: 18, c: 3 } },
    ]

    XLSX.utils.book_append_sheet(workbook, userInfoSheet, "👤 Profil")

    // ===== DETAILED SESSIONS SHEET =====
    const sessions = filterSessionsByDateRange(processUserSessions(user), startDate, endDate)
    const sessionsData = [
        [`📊 DETALJNE SESIJE - ${user.name.toUpperCase()}`, "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        [""],
        [
            "📅 Datum",
            "🕐 Početak",
            "📍 Lok. dolaska",
            "📝 Napomena in",
            "🕕 Kraj",
            "📍 Lok. odlaska",
            "📝 Napomena out",
            "⏱️ Ukupno (h)",
            "⏱️ Ukupno (min)",
            "🕐 Regularno",
            "⚡ Prekovremeno",
            "💵 Reg. zarada",
            "💎 Prek. zarada",
            "💰 UKUPNO",
            "📅 Dan",
            "🆔 ID",
        ],
    ]

    sessions.forEach((session) => {
        const clockInDate = new Date(session.clockIn)
        const totalEarnings = session.earningsRegular + session.earningsOvertime

        sessionsData.push([
            clockInDate.toLocaleDateString("sr-RS"),
            clockInDate.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
            session.locationIn || "—",
            session.notesIn || "—",
            new Date(session.clockOut).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" }),
            session.locationOut || "—",
            session.notesOut || "—",
            (session.durationMinutes / 60).toFixed(2),
            session.durationMinutes,
            session.regularMinutes,
            session.overtimeMinutes,
            `${formatCurrency(session.earningsRegular)} RSD`,
            `${formatCurrency(session.earningsOvertime)} RSD`,
            `${formatCurrency(totalEarnings)} RSD`,
            clockInDate.toLocaleDateString("sr-Latn-RS", { weekday: "long" }),
            session.id.substring(0, 8) + "...",
        ])
    })

    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)

    // Set column widths
    setColumnWidths(sessionsSheet, [12, 10, 15, 25, 10, 15, 25, 10, 10, 10, 12, 15, 15, 18, 12, 15])

    // Merge title
    sessionsSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }]

    XLSX.utils.book_append_sheet(workbook, sessionsSheet, "📊 Sesije")

    // ===== DAILY ANALYTICS SHEET =====
    const dailySummary: Record<
        string,
        {
            sessions: number
            duration: number
            earnings: number
            regularMinutes: number
            overtimeMinutes: number
        }
    > = {}

    sessions.forEach((session) => {
        const date = new Date(session.clockIn).toLocaleDateString("sr-RS")
        if (!dailySummary[date]) {
            dailySummary[date] = { sessions: 0, duration: 0, earnings: 0, regularMinutes: 0, overtimeMinutes: 0 }
        }
        dailySummary[date].sessions++
        dailySummary[date].duration += session.durationMinutes
        dailySummary[date].earnings += session.earningsRegular + session.earningsOvertime
        dailySummary[date].regularMinutes += session.regularMinutes
        dailySummary[date].overtimeMinutes += session.overtimeMinutes
    })

    const dailySummaryData = [
        [`📅 DNEVNI PREGLED - ${user.name.toUpperCase()}`, "", "", "", "", "", "", ""],
        [""],
        [
            "📅 Datum",
            "📅 Dan u nedelji",
            "📊 Sesije",
            "⏱️ Ukupno (h)",
            "🕐 Regularno (min)",
            "⚡ Prekovremeno (min)",
            "💰 Zarada (RSD)",
            "📈 Efikasnost",
        ],
    ]

    Object.entries(dailySummary)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .forEach(([date, data]) => {
            const dayOfWeek = new Date(date).toLocaleDateString("sr-Latn-RS", { weekday: "long" })
            const efficiency = data.sessions > 0 ? data.earnings / data.sessions : 0

            dailySummaryData.push([
                date,
                dayOfWeek,
                `${data.sessions}`,
                (data.duration / 60).toFixed(1),
                `${data.regularMinutes}`,
                `${data.overtimeMinutes}`,
                `${formatCurrency(data.earnings)} RSD`,
                `${formatCurrency(efficiency)} RSD/sesija`,
            ])
        })

    const dailySummarySheet = XLSX.utils.aoa_to_sheet(dailySummaryData)

    // Set column widths
    setColumnWidths(dailySummarySheet, [15, 15, 10, 12, 15, 15, 18, 20])

    // Merge title
    dailySummarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]

    XLSX.utils.book_append_sheet(workbook, dailySummarySheet, "📅 Dnevni pregled")

    // Export with enhanced filename
    const fileName = `👤_${user.name.replace(/\s+/g, "_")}_Izvestaj_${startDate.toISOString().split("T")[0]}_do_${endDate.toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
}
