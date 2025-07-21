import * as XLSX from "xlsx"
import {formatDate, formatDuration, formatTime} from "./helper"
import {translateDayToSerbian} from "@/lib/translate";

export interface ExcelExportOptions {
    user: any
    anals: any
    dateRange: {
        from: Date
        to?: Date
    }
}

export const createAdvancedExcelExport = async (options: ExcelExportOptions) => {
    const { user, anals, dateRange } = options

    const workbook = XLSX.utils.book_new()

    // Sheet 1: Executive Summary with styling
    const summaryData = [
        ["IZVEŠAJ O ANALITICI RADA", "", "", "", ""],
        ["", "", "", "", ""],
        ["INFORMACIJE O KORISNIKU", "", "", "", ""],
        ["Ime i prezime:", user.name, "", "", ""],
        ["Korisničko ime:", user.username, "", "", ""],
        ["Uloga:", user.role, "", "", ""],
        ["Satnica:", user.hourly_rate ? `${user.hourly_rate} RSD/sat` : "N/A", "", "", ""],
        [
            "Period izveštaja:",
            `${dateRange.from.toLocaleDateString("sr-RS")} - ${dateRange.to?.toLocaleDateString("sr-RS")}`,
            "",
            "",
            "",
        ],
        ["Datum kreiranja:", new Date().toLocaleDateString("sr-RS"), "", "", ""],
        ["", "", "", "", ""],
        ["KLJUČNI POKAZATELJI PERFORMANSI (KPI)", "", "", "", ""],
        ["Ukupno radnih sesija", anals.totalSessions, "sesija", "", ""],
        ["Ukupno vreme rada", formatDuration(anals.totalDuration/60), "", "", ""],
        ["Redovno radno vreme", formatDuration(anals.totalRegular/60), "", "", ""],
        ["Prekovremeno radno vreme", formatDuration(anals.totalOvertime/60), "", "", ""],
        ["Procenat prekovremenih sati", `${anals.overtimePercentage.toFixed(2)}%`, "", "", ""],
        ["Prosečno trajanje sesije", formatDuration(anals.averageSessionDuration/60), "", "", ""],
        ["", "", "", "", ""],
        ["ANALIZA POKUŠAJA PRIJAVE", "", "", "", ""],
        ["Ukupno pokušaja prijave/odjave", anals.totalAttempts, "pokušaja", "", ""],
        ["Uspešni pokušaji", anals.successfulAttempts, "pokušaja", "", ""],
        ["Neuspešni pokušaji", anals.failedAttempts, "pokušaja", "", ""],
        ["Ukupna stopa uspeha", `${anals.overallSuccessRate.toFixed(2)}%`, "", "", ""],
        ["Clock IN pokušaji", anals.clockInAttempts, "pokušaja", "", ""],
        ["Clock IN stopa uspeha", `${anals.clockInSuccessRate.toFixed(2)}%`, "", "", ""],
        ["Clock OUT pokušaji", anals.clockOutAttempts, "pokušaja", "", ""],
        ["Clock OUT stopa uspeha", `${anals.clockOutSuccessRate.toFixed(2)}%`, "", "", ""],
        ["", "", "", "", ""],
        ["FINANSIJSKI PREGLED", "", "", "", ""],
        ["Ukupna potencijalna zarada", `${anals.totalEarnings.toFixed(2)} RSD`, "", "", ""],
        ["Zarada od redovnog rada", `${anals.regularEarnings.toFixed(2)} RSD`, "", "", ""],
        ["Zarada od prekovremenog rada", `${anals.overtimeEarnings.toFixed(2)} RSD`, "", "", ""],
        ["Prosečna zarada po sesiji", `${(anals.totalEarnings / anals.totalSessions).toFixed(2)} RSD`, "", "", ""],
        ["", "", "", "", ""],
        ["ANALIZA RADNIH OBRAZACA", "", "", "", ""],
        ["Najaktivniji dan u nedelji", translateDayToSerbian(anals.mostActiveDay), "", "", ""],
        ["Najmanje aktivan dan", translateDayToSerbian(anals.leastActiveDay), "", "", ""],
        ["Najproduktivniji dan", translateDayToSerbian(anals.mostProductiveDay), "", "", ""],
        ["Najduža radna sesija", formatDuration(anals.longestSession/60), "", "", ""],
        ["Najkraća radna sesija", formatDuration(anals.shortestSession/60), "", "", ""],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths for summary sheet
    summarySheet["!cols"] = [
        { width: 35 }, // Column A - Labels
        { width: 25 }, // Column B - Values
        { width: 15 }, // Column C - Units
        { width: 10 }, // Column D - Extra
        { width: 10 }, // Column E - Extra
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Izvršni pregled")

    // Sheet 2: Detailed Daily Breakdown
    const dailyHeaders = [
        "Dan u nedelji",
        "Broj sesija",
        "Ukupno vreme",
        "Redovno vreme",
        "Prekovremeno vreme",
        "Ukupno pokušaja",
        "Uspešni pokušaji",
        "Neuspešni pokušaji",
        "Stopa uspeha (%)",
        "Potencijalna zarada (RSD)",
    ]

    const dailyData = [dailyHeaders]

    Object.entries(anals.dailyStats).forEach(([day, stats]: any) => {
        const successRate = stats.attempts > 0 ? (stats.successfulAttempts / stats.attempts) * 100 : 0
        dailyData.push([
            translateDayToSerbian(day),
            stats.sessions,
            formatDuration(stats.duration/60),
            formatDuration(stats.regular/60),
            formatDuration(stats.overtime/60),
            stats.attempts,
            stats.successfulAttempts,
            stats.attempts - stats.successfulAttempts,
            successRate.toFixed(2),
            stats.earnings.toFixed(2),
        ])
    })

    const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)

    // Set column widths for daily sheet
    dailySheet["!cols"] = [
        { width: 15 }, // Day
        { width: 12 }, // Sessions
        { width: 15 }, // Total time
        { width: 15 }, // Regular time
        { width: 18 }, // Overtime
        { width: 15 }, // Total attempts
        { width: 15 }, // Successful
        { width: 15 }, // Failed
        { width: 15 }, // Success rate
        { width: 20 }, // Earnings
    ]

    XLSX.utils.book_append_sheet(workbook, dailySheet, "Nedeljni detalji")

    // Sheet 3: Chronological Activity Log
    const activityHeaders = [
        "Datum",
        "Broj sesija",
        "Ukupno vreme rada",
        "Prekovremeno vreme",
        "Broj pokušaja",
        "Stopa uspeha (%)",
        "Dnevna zarada (RSD)",
    ]

    const activityData = [activityHeaders]

    anals.recentActivity.forEach((day: any) => {
        activityData.push([
            day.date,
            day.sessions,
            formatDuration(day.duration/60),
            formatDuration(day.overtime/60),
            day.attempts,
            day.successRate.toFixed(2),
            day.earnings.toFixed(2),
        ])
    })

    const activitySheet = XLSX.utils.aoa_to_sheet(activityData)

    // Set column widths for activity sheet
    activitySheet["!cols"] = [
        { width: 12 }, // Date
        { width: 12 }, // Sessions
        { width: 18 }, // Total time
        { width: 18 }, // Overtime
        { width: 15 }, // Attempts
        { width: 15 }, // Success rate
        { width: 18 }, // Earnings
        { width: 20 }, // Notes
    ]

    XLSX.utils.book_append_sheet(workbook, activitySheet, "Hronološka aktivnost")

    // Sheet 4: Complete Attempts Log
    const attemptsHeaders = [
        "Redni broj",
        "ID pokušaja",
        "Tip akcije",
        "Datum",
        "Vreme",
        "Status",
        "Lokacija",
        "Napomene",
        "Dan u nedelji",
    ]

    const attemptsData = [attemptsHeaders]

    anals.filteredAttempts.forEach((attempt: any, index: number) => {
        const attemptDate = new Date(attempt.timestamp)
        const dayOfWeek = attemptDate.toLocaleDateString("sr-RS", { weekday: "long" })

        attemptsData.push([
            index + 1,
            attempt.id,
            `Clock ${attempt.type}`,
            formatDate(attempt.timestamp),
            formatTime(attempt.timestamp),
            attempt.success ? "Uspešno" : "Neuspešno",
            attempt.location || "Nije specificirano",
            attempt.notes || "Bez napomena",
            dayOfWeek,
        ])
    })

    const attemptsSheet = XLSX.utils.aoa_to_sheet(attemptsData)

    // Set column widths for attempts sheet
    attemptsSheet["!cols"] = [
        { width: 12 }, // Serial number
        { width: 25 }, // ID
        { width: 15 }, // Type
        { width: 12 }, // Date
        { width: 10 }, // Time
        { width: 12 }, // Status
        { width: 20 }, // Location
        { width: 30 }, // Notes
        { width: 15 }, // Day of week
    ]

    XLSX.utils.book_append_sheet(workbook, attemptsSheet, "Kompletni log pokušaja")

    // Sheet 5: Performance Analytics
    const performanceData = [
        ["ANALIZA PERFORMANSI", "", "", ""],
        ["", "", "", ""],
        ["EFIKASNOST RADA", "", "", ""],
        ["Prosečno vreme po sesiji", formatDuration(anals.averageSessionDuration/60), "", ""],
        ["Najkraća sesija", formatDuration(anals.shortestSession/60), "", ""],
        ["Najduža sesija", formatDuration(anals.longestSession/60), "", ""],
        ["", "", "", ""],
        ["ANALIZA POKUŠAJA PRIJAVE", "", "", ""],
        ["Ukupna efikasnost", `${anals.overallSuccessRate.toFixed(2)}%`, "", ""],
        ["Clock IN efikasnost", `${anals.clockInSuccessRate.toFixed(2)}%`, "", ""],
        ["Clock OUT efikasnost", `${anals.clockOutSuccessRate.toFixed(2)}%`, "", ""],
        ["Razlika u efikasnosti", `${Math.abs(anals.clockInSuccessRate - anals.clockOutSuccessRate).toFixed(2)}%`, "", ""],
        ["", "", "", ""],
        ["FINANSIJSKA ANALIZA", "", "", ""],
        ["Ukupna zarada", `${anals.totalEarnings.toFixed(2)} RSD`, "", ""],
        ["Zarada po satu (prosek)", user.hourly_rate ? `${user.hourly_rate} RSD` : "N/A", "", ""],
        ["Zarada po sesiji (prosek)", `${(anals.totalEarnings / anals.totalSessions).toFixed(2)} RSD`, "", ""],
        ["Procenat prekovremene zarade", `${((anals.overtimeEarnings / anals.totalEarnings) * 100).toFixed(2)}%`, "", ""],
        ["", "", "", ""],
        ["PREPORUKE ZA POBOLJŠANJE", "", "", ""],
        [
            anals.overallSuccessRate < 70 ? "Potrebno poboljšanje efikasnosti prijave" : "Dobra efikasnost prijave",
            "",
            "",
            "",
        ],
        [anals.overtimePercentage > 20 ? "Visok procenat prekovremenih sati" : "Umeren procenat prekovremenih", "", "", ""],
        [anals.totalSessions < 20 ? "Niska aktivnost - potrebno više sesija" : "Dobra aktivnost", "", "", ""],
    ]

    const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData)

    // Set column widths for performance sheet
    performanceSheet["!cols"] = [
        { width: 40 }, // Metric name
        { width: 20 }, // Value
        { width: 15 }, // Extra
        { width: 15 }, // Extra
    ]

    XLSX.utils.book_append_sheet(workbook, performanceSheet, "Analiza performansi")

    return workbook
}

export const exportAnalyticsToExcel = async (options: ExcelExportOptions) => {
    try {
        const workbook = await createAdvancedExcelExport(options)

        // Generate filename
        const fromDate = options.dateRange.from.toLocaleDateString("sr-RS").replace(/\./g, "-")
        const toDate = options.dateRange.to?.toLocaleDateString("sr-RS").replace(/\./g, "-")
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `Detaljni_Izvestaj_${options.user.name.replace(/\s+/g, "_")}_${fromDate}_do_${toDate}_${timestamp}.xlsx`

        // Write and download
        XLSX.writeFile(workbook, filename)

        return { success: true, filename }
    } catch (error) {
        console.error("Excel export failed:", error)
        return { success: false, error }
    }
}
