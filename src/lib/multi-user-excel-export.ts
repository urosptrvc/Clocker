import * as XLSX from "xlsx"
import { formatDuration } from "./helper"
import { translateDayToSerbian } from "@/lib/translate"


export const createMultiUserExcelExport = async (
    users: any[],
    anals: any[],
    dateRange: { from: Date; to?: Date },
) => {
    const reportTitle = "Izveštaj o produktivnosti zaposlenih"
    const workbook = XLSX.utils.book_new()

    // Combine users with their analytics data
    const combinedData = users.map((user, index) => ({
        user,
        anals: anals[index]
    }))

    // Sheet 1: Executive Dashboard - Overview of all users
    const dashboardData = [
        [reportTitle.toUpperCase(), "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", ""],
        [
            `Period: ${dateRange.from.toLocaleDateString("sr-RS")} - ${dateRange.to?.toLocaleDateString("sr-RS")}`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [`Datum kreiranja: ${new Date().toLocaleDateString("sr-RS")}`, "", "", "", "", "", "", "", "", "", "", ""],
        [`Ukupno zaposlenih: ${users.length}`, "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", ""],
        [
            "Ime i prezime",
            "Uloga",
            "Sesije",
            "Ukupno vreme",
            "Prekovremeno",
            "% Prekovremeno",
            "Stopa uspeha",
            "Zarada (RSD)",
            "Prosek/sesija",
            "Najaktivniji dan",
            "Efikasnost",
        ],
    ]

    // Add user data rows
    combinedData.forEach(({ user, anals }) => {

        const efficiency = anals.totalSessions > 0 ? (anals.totalDuration / anals.totalSessions / 60).toFixed(1) : "0"

        dashboardData.push([
            user.name,
            user.role,
            anals.totalSessions,
            formatDuration(anals.totalDuration / 60),
            formatDuration(anals.totalOvertime / 60),
            `${anals.overtimePercentage.toFixed(1)}%`,
            `${anals.overallSuccessRate.toFixed(1)}%`,
            anals.totalEarnings.toFixed(0),
            `${(anals.totalEarnings / Math.max(anals.totalSessions, 1)).toFixed(0)} RSD`,
            translateDayToSerbian(anals.mostActiveDay),
            `${efficiency}h/sesija`,
        ])
    })

    // Add summary statistics
    const totalSessions = anals.reduce((sum, anal) => sum + anal.totalSessions, 0)
    const totalDuration = anals.reduce((sum, anal) => sum + anal.totalDuration, 0)
    const totalEarnings = anals.reduce((sum, anal) => sum + anal.totalEarnings, 0)
    const avgSuccessRate = anals.reduce((sum, anal) => sum + anal.overallSuccessRate, 0) / anals.length

    dashboardData.push(
        ["", "", "", "", "", "", "", "", "", "", "", ""],
        [
            "UKUPNO/PROSEK",
            "",
            totalSessions,
            formatDuration(totalDuration / 60),
            "",
            "",
            `${avgSuccessRate.toFixed(1)}%`,
            totalEarnings.toFixed(0),
            `${(totalEarnings / Math.max(totalSessions, 1)).toFixed(0)} RSD`,
            "",
            "",
            "",
        ],
    )

    const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData)

    // Set column widths for dashboard
    dashboardSheet["!cols"] = [
        { width: 20 }, // Name
        { width: 15 }, // Role
        { width: 10 }, // Sessions
        { width: 15 }, // Total time
        { width: 15 }, // Overtime
        { width: 12 }, // % Overtime
        { width: 12 }, // Success rate
        { width: 15 }, // Earnings
        { width: 15 }, // Avg per session
        { width: 15 }, // Most active day
        { width: 15 }, // Efficiency
        { width: 18 }, // Status
    ]

    XLSX.utils.book_append_sheet(workbook, dashboardSheet, "Pregled zaposlenih")

    // Sheet 2: Performance Comparison
    const comparisonData = [
        ["POREĐENJE PERFORMANSI", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["Zaposleni", "Produktivnost", "Pouzdanost", "Efikasnost", "Prekovremeni rad", "Ukupna ocena", "Rang"],
    ]

    // Calculate rankings
    const userPerformance = combinedData
        .map(({ user, anals }) => {
            const productivity = Math.min((anals.totalSessions / 30) * 100, 100) // Assuming 30 sessions is excellent
            const reliability = anals.overallSuccessRate
            const efficiency = Math.min((anals.averageSessionDuration / 60 / 8) * 100, 100) // 8 hours as reference
            const overtimeScore = Math.max(100 - anals.overtimePercentage * 2, 0) // Penalty for too much overtime
            const overallScore = productivity * 0.3 + reliability * 0.3 + efficiency * 0.2 + overtimeScore * 0.2

            return {
                user,
                anals,
                scores: {
                    productivity: productivity.toFixed(1),
                    reliability: reliability.toFixed(1),
                    efficiency: efficiency.toFixed(1),
                    overtime: overtimeScore.toFixed(1),
                    overall: overallScore.toFixed(1),
                },
            }
        })
        .sort((a, b) => Number.parseFloat(b.scores.overall) - Number.parseFloat(a.scores.overall))

    userPerformance.forEach((item, index) => {
        comparisonData.push([
            item.user.name,
            `${item.scores.productivity}%`,
            `${item.scores.reliability}%`,
            `${item.scores.efficiency}%`,
            `${item.scores.overtime}%`,
            `${item.scores.overall}%`,
            index + 1,
        ])
    })

    const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData)
    comparisonSheet["!cols"] = [
        { width: 20 }, // Name
        { width: 15 }, // Productivity
        { width: 15 }, // Reliability
        { width: 15 }, // Efficiency
        { width: 18 }, // Overtime
        { width: 15 }, // Overall
        { width: 8 }, // Rank
    ]

    XLSX.utils.book_append_sheet(workbook, comparisonSheet, "Poređenje performansi")

    // Sheet 3: Department Summary (if roles are available)
    const roleStats = combinedData.reduce(
        (acc, { user, anals }) => {
            if (!acc[user.role]) {
                acc[user.role] = {
                    count: 0,
                    totalSessions: 0,
                    totalDuration: 0,
                    totalEarnings: 0,
                    totalSuccessRate: 0,
                }
            }
            acc[user.role].count++
            acc[user.role].totalSessions += anals.totalSessions
            acc[user.role].totalDuration += anals.totalDuration
            acc[user.role].totalEarnings += anals.totalEarnings
            acc[user.role].totalSuccessRate += anals.overallSuccessRate
            return acc
        },
        {} as Record<string, any>,
    )

    const departmentData = [
        ["PREGLED PO ULOGAMA", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        [
            "Uloga",
            "Broj zaposlenih",
            "Ukupno sesija",
            "Prosečno vreme",
            "Prosečna stopa uspeha",
            "Ukupna zarada",
            "Zarada po zaposlenom",
        ],
    ]

    Object.entries(roleStats).forEach(([role, stats]) => {
        departmentData.push([
            role,
            stats.count,
            stats.totalSessions,
            formatDuration(stats.totalDuration / 60),
            `${(stats.totalSuccessRate / stats.count).toFixed(1)}%`,
            `${stats.totalEarnings.toFixed(0)} RSD`,
            `${(stats.totalEarnings / stats.count).toFixed(0)} RSD`,
        ])
    })

    const departmentSheet = XLSX.utils.aoa_to_sheet(departmentData)
    departmentSheet["!cols"] = [
        { width: 20 }, // Role
        { width: 18 }, // Count
        { width: 15 }, // Sessions
        { width: 18 }, // Avg time
        { width: 20 }, // Success rate
        { width: 18 }, // Total earnings
        { width: 20 }, // Earnings per employee
    ]

    XLSX.utils.book_append_sheet(workbook, departmentSheet, "Pregled po ulogama")

    // Sheet 4: Top Performers & Alerts
    const alertsData = [
        ["KLJUČNI POKAZATELJI I UPOZORENJA", "", "", ""],
        ["", "", "", ""],
        ["TOP PERFORMERI", "", "", ""],
        ["", "", "", ""],
    ]

    // Top 5 performers
    const topPerformers = userPerformance.slice(0, Math.min(5, users.length))
    alertsData.push(["Rang", "Zaposleni", "Ukupna ocena", "Ključna prednost"])

    topPerformers.forEach((performer, index) => {
        const keyStrength =
            Number.parseFloat(performer.scores.reliability) > 95
                ? "Visoka pouzdanost"
                : Number.parseFloat(performer.scores.productivity) > 90
                    ? "Visoka produktivnost"
                    : Number.parseFloat(performer.scores.efficiency) > 90
                        ? "Visoka efikasnost"
                        : "Uravnotežene performanse"

        alertsData.push([index + 1, performer.user.name, `${performer.scores.overall}%`, keyStrength])
    })

    // Alerts section
    alertsData.push(["", "", "", ""], ["UPOZORENJA I PREPORUKE", "", "", ""], ["", "", "", ""])

    const alerts = []
    combinedData.forEach(({ user, anals }) => {
        if (anals.overallSuccessRate < 70) {
            alerts.push([user.name, "Niska stopa uspeha", `${anals.overallSuccessRate.toFixed(1)}%`, "Potrebna obuka"])
        }
        if (anals.overtimePercentage > 30) {
            alerts.push([
                user.name,
                "Visok procenat prekovremenih",
                `${anals.overtimePercentage.toFixed(1)}%`,
                "Preispitati opterećenje",
            ])
        }
        if (anals.totalSessions < 10) {
            alerts.push([user.name, "Niska aktivnost", `${anals.totalSessions} sesija`, "Povećati angažovanje"])
        }
    })

    if (alerts.length > 0) {
        alertsData.push(["Zaposleni", "Problem", "Vrednost", "Preporuka"])
        alerts.forEach((alert) => alertsData.push(alert))
    } else {
        alertsData.push(["Nema kritičnih upozorenja", "", "", ""])
    }

    const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData)
    alertsSheet["!cols"] = [
        { width: 20 }, // Name/Rank
        { width: 25 }, // Issue/Employee
        { width: 15 }, // Score/Value
        { width: 25 }, // Strength/Recommendation
    ]

    XLSX.utils.book_append_sheet(workbook, alertsSheet, "Top performeri i upozorenja")

    return workbook
}

export const exportMultiUserAnalyticsToExcel = async (
    users: any[],
    anals: any[],
    dateRange: { from: Date; to?: Date },
) => {
    try {
        const workbook = await createMultiUserExcelExport(users, anals, dateRange)

        // Generate filename
        const fromDate = dateRange.from.toLocaleDateString("sr-RS").replace(/\./g, "-")
        const toDate = dateRange.to?.toLocaleDateString("sr-RS").replace(/\./g, "-")
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `Izvestaj_Zaposlenih_${fromDate}_do_${toDate}_${timestamp}.xlsx`

        // Write and download
        XLSX.writeFile(workbook, filename)

        return { success: true, filename }
    } catch (error) {
        console.error("Multi-user Excel export failed:", error)
        return { success: false, error }
    }
}

// Update quick summary function as well
export const createQuickSummaryExport = async (
    users: any[],
    anals: any[],
    dateRange: { from: Date; to?: Date }
) => {
    const workbook = XLSX.utils.book_new()
    const combinedData = users.map((user, index) => ({ user, anals: anals[index] }))

    const summaryData = [
        ["BRZI PREGLED ZAPOSLENIH", "", "", "", "", "", "", ""],
        [
            `Period: ${dateRange.from.toLocaleDateString("sr-RS")} - ${dateRange.to?.toLocaleDateString("sr-RS")}`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        ["", "", "", "", "", "", "", ""],
        ["Zaposleni", "Uloga", "Sesije", "Vreme rada", "Stopa uspeha", "Zarada", "Status", "Napomene"],
    ]

    combinedData.forEach(({ user, anals }) => {
        const status =
            anals.overallSuccessRate >= 90
                ? "⭐ Odličan"
                : anals.overallSuccessRate >= 75
                    ? "✅ Dobar"
                    : anals.overallSuccessRate >= 60
                        ? "⚠️ Prosečan"
                        : "❌ Kritičan"

        const notes = []
        if (anals.overtimePercentage > 25) notes.push("Visoko prekovremeno")
        if (anals.totalSessions < 15) notes.push("Niska aktivnost")
        if (anals.overallSuccessRate < 70) notes.push("Potrebna obuka")

        summaryData.push([
            user.name,
            user.role,
            anals.totalSessions,
            formatDuration(anals.totalDuration / 60),
            `${anals.overallSuccessRate.toFixed(1)}%`,
            `${anals.totalEarnings.toFixed(0)} RSD`,
            status,
            notes.join(", ") || "OK",
        ])
    })

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet["!cols"] = [
        { width: 20 }, // Name
        { width: 15 }, // Role
        { width: 10 }, // Sessions
        { width: 15 }, // Time
        { width: 12 }, // Success rate
        { width: 15 }, // Earnings
        { width: 15 }, // Status
        { width: 30 }, // Notes
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Brzi pregled")
    return workbook
}
