import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Timer, DollarSign, Clock, TrendingUp} from "lucide-react"
import {formatDuration} from "@/lib/helper"

export function SessionSummary({
                                   sessions,
                                   totalDuration,
                                   totalRegularMinutes,
                                   totalOvertimeMinutes,
                                   totalEarnings,
                                   totalEarningsRegular,
                                   totalEarningsOvertime,
                                   filterDescription,
                                   filterBy,
                               }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("sr-RS", {
            style: "currency",
            currency: "RSD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5"/>
                    Sazetak - {filterDescription}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{sessions.length}</div>
                        <div className="text-sm text-muted-foreground">Ukupno Sesija</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{formatDuration(totalDuration)}</div>
                        <div className="text-sm text-muted-foreground">Ukupno Vremena</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
                        <div className="text-sm text-muted-foreground">Ukupna Zarada</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {sessions.length > 0 ? sessions[0]?.hourly_rate : 0} RSD
                        </div>
                        <div className="text-sm text-muted-foreground">Satnica</div>
                    </div>
                </div>

                {/* Time Breakdown */}
                <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4"/>
                        Raspored Vremena
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg">
                            <div className="text-xl font-bold text-primary">{formatDuration(totalRegularMinutes)}</div>
                            <div className="text-sm text-muted-foreground">Regularno Vreme</div>
                        </div>
                        <div className="text-center p-3 text-primary rounded-lg">
                            <div className="text-xl font-bold text-orange-500">{formatDuration(totalOvertimeMinutes)}</div>
                            <div className="text-sm text-muted-foreground">Prekovremeno</div>
                        </div>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4"/>
                        Raspored Zarade
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center p-3  rounded-lg">
                            <div className="text-xl font-bold text-primary">{formatCurrency(totalEarningsRegular)}</div>
                            <div className="text-sm text-muted-foreground">Regularna Zarada</div>
                        </div>
                        <div className="text-center p-3  rounded-lg">
                            <div
                                className="text-xl font-bold text-orange-500">{formatCurrency(totalEarningsOvertime)}</div>
                            <div className="text-sm text-muted-foreground">Prekovremena Zarada</div>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary for custom-month filter */}
                {filterBy === "custom-month" && totalDuration > 0 && (
                    <div className="border-t pt-4 mt-4">
                        <div
                            className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-primary"/>
                                <div className="text-lg font-semibold text-primary">Mesečni Pregled</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="font-medium">{formatDuration(totalDuration)}</div>
                                    <div className="text-muted-foreground">Ukupno Vreme</div>
                                </div>
                                <div>
                                    <div className="font-medium text-green-600">{formatCurrency(totalEarnings)}</div>
                                    <div className="text-muted-foreground">Ukupna Zarada</div>
                                </div>
                                <div>
                                    <div className="font-medium">{sessions.length}</div>
                                    <div className="text-muted-foreground">Broj Sesija</div>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">{filterDescription}</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
