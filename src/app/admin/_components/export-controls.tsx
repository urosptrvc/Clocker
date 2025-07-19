"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileSpreadsheet, Calendar } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {exportAllUsersToExcel} from "@/lib/excel-export";

export function ExportControls({ users, dateRange, onDateRangeChange }) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await exportAllUsersToExcel(users, dateRange.from, dateRange.to)
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Export Period</span>
                        </div>
                        <DatePickerWithRange
                            selected={dateRange}
                            onSelectAction={(range) => {
                                if (range?.from && range?.to) {
                                    onDateRangeChange(range)
                                }
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
                            {isExporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Export All Users
                                </>
                            )}
                        </Button>

                        <div className="text-xs text-muted-foreground text-center">{users.length} users • Excel format</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
