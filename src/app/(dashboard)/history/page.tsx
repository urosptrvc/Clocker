"use client"

import { useState, useMemo } from "react"
import { Suspense } from "react"
import { useSessions } from "@/app/hooks/useSessions"
import { getMonthDateRange, getMonthOptions } from "@/lib/helper"
import { SessionFilters } from "@/app/(dashboard)/history/_components/session-filters"
import { SessionSummarySkeleton } from "@/app/(dashboard)/history/_components/session-summary-skeleton"
import { SessionSummary } from "@/app/(dashboard)/history/_components/session-summary"
import { SessionsListSkeleton } from "@/app/(dashboard)/history/_components/sessions-list-skeleton"
import { SessionsList } from "@/app/(dashboard)/history/_components/sessions-list"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"

export default function WorkSessionTracker() {
    const session = useSession()
    if (!session) redirect("/login")

    const [sortBy, setSortBy] = useState<"date" | "duration">("date")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [filterBy, setFilterBy] = useState<"all" | "today" | "week" | "month" | "custom-month">("all")
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

    const { sessions, isLoading } = useSessions()

    const filteredAndSortedSessions = useMemo(() => {
        let filtered = Array.isArray(sessions) ? [...sessions] : []
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        switch (filterBy) {
            case "today":
                filtered = filtered.filter((session) => new Date(session.clockIn) >= today)
                break
            case "week":
                filtered = filtered.filter((session) => new Date(session.clockIn) >= weekAgo)
                break
            case "month":
                filtered = filtered.filter((session) => new Date(session.clockIn) >= monthAgo)
                break
            case "custom-month":
                const { startDate, endDate } = getMonthDateRange(selectedMonth)
                filtered = filtered.filter((session) => {
                    const sessionDate = new Date(session.clockIn)
                    return sessionDate >= startDate && sessionDate <= endDate
                })
                break
        }

        filtered.sort((a, b) => {
            let comparison = 0
            if (sortBy === "date") {
                comparison = new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
            } else if (sortBy === "duration") {
                // Updated to use durationMinutes instead of duration
                comparison = a.durationMinutes - b.durationMinutes
            }
            return sortOrder === "asc" ? comparison : -comparison
        })

        return filtered
    }, [sessions, sortBy, sortOrder, filterBy, selectedMonth])

    // Updated to use durationMinutes and calculate total earnings
    const sessionStats = useMemo(() => {
        const totalDuration = filteredAndSortedSessions.reduce((total, session) => total + session.durationMinutes, 0)
        const totalRegularMinutes = filteredAndSortedSessions.reduce((total, session) => total + session.regularMinutes, 0)
        const totalOvertimeMinutes = filteredAndSortedSessions.reduce(
            (total, session) => total + session.overtimeMinutes,
            0,
        )
        const totalEarningsRegular = filteredAndSortedSessions.reduce(
            (total, session) => total + session.earningsRegular,
            0,
        )
        const totalEarningsOvertime = filteredAndSortedSessions.reduce(
            (total, session) => total + session.earningsOvertime,
            0,
        )
        const totalEarnings = totalEarningsRegular + totalEarningsOvertime

        return {
            totalDuration,
            totalRegularMinutes,
            totalOvertimeMinutes,
            totalEarnings,
            totalEarningsRegular,
            totalEarningsOvertime,
        }
    }, [filteredAndSortedSessions])

    const getFilterDescription = (): string => {
        switch (filterBy) {
            case "today":
                return "Danas"
            case "week":
                return "Ove nedelje"
            case "month":
                return "Poslednjih 30 dana"
            case "custom-month":
                const monthOptions = getMonthOptions()
                const selectedOption = monthOptions.find((opt) => opt.value === selectedMonth)
                return selectedOption ? selectedOption.label : "Odabrani mesec"
            default:
                return "Ukupno"
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Radne Sesije</h1>
                    <p className="text-muted-foreground">Prati svoje vreme rada i zarade</p>
                </div>
                <SessionFilters
                    filterBy={filterBy}
                    setFilterBy={setFilterBy}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />
            </div>

            <Suspense fallback={<SessionSummarySkeleton />}>
                {isLoading ? (
                    <SessionSummarySkeleton />
                ) : (
                    <SessionSummary
                        sessions={filteredAndSortedSessions}
                        totalDuration={sessionStats.totalDuration}
                        totalRegularMinutes={sessionStats.totalRegularMinutes}
                        totalOvertimeMinutes={sessionStats.totalOvertimeMinutes}
                        totalEarnings={sessionStats.totalEarnings}
                        totalEarningsRegular={sessionStats.totalEarningsRegular}
                        totalEarningsOvertime={sessionStats.totalEarningsOvertime}
                        filterDescription={getFilterDescription()}
                        filterBy={filterBy}
                    />
                )}
            </Suspense>

            <Suspense fallback={<SessionsListSkeleton />}>
                {isLoading ? <SessionsListSkeleton /> : <SessionsList sessions={filteredAndSortedSessions} />}
            </Suspense>
        </div>
    )
}
