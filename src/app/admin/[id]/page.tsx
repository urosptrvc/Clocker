
"use client"

import {useEffect, useState} from "react"
import {Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    ArrowLeft,
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    ImageIcon,
    MapPin,
    Shield,
    Timer,
    UserIcon,
    X,
    XCircle,
} from "lucide-react"
import {formatDate, formatDuration, formatTime} from "@/lib/helper"
import {DatePickerWithRange} from "@/components/ui/date-range-picker"
import {getDetailedUserAnalytics, processUserSessions} from "@/lib/data-processing"
import {exportSingleUserToExcel} from "@/lib/excel-export"
import {useUsers} from "@/app/hooks/useUsers"
import {useParams, useRouter} from "next/navigation"

type DateRange = {
    from: Date
    to?: Date
}

export default function UserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id
    const [localDateRange, setLocalDateRange] = useState<DateRange>({
        from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    })
    const [isExporting, setIsExporting] = useState(false)
    const [selectedAttempt, setSelectedAttempt] = useState(null)
    const [isAttemptDrawerOpen, setIsAttemptDrawerOpen] = useState(false)

    const {fetchUser, user, isLoading} = useUsers()

    useEffect(() => {
        if (userId) {
            fetchUser(userId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Loading state
    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Učitavanje detalja korisnika...</p>
                </div>
            </div>
        )
    }

    const analytics = getDetailedUserAnalytics(user)
    const recentSessions = processUserSessions(user)
    const recentAttempts = user.clockAttempts || []

    // Calculate potential earnings based on total time worked
    const potentialEarnings = user.hourly_rate ? (analytics.totalDuration / 3600) * user.hourly_rate : 0

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await exportSingleUserToExcel(user, localDateRange.from, localDateRange.to)
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleAttemptClick = (attempt) => {
        setSelectedAttempt(attempt)
        setIsAttemptDrawerOpen(true)
    }

    const handleBack = () => {
        router.push("/admin")
    }

    const getAttemptImages = (attempt) => {
        if (!attempt) return []
        return [
            {
                path: attempt.FrontTruckPath,
                label: "Prednji deo vozila",
                alt: "Pogled na prednji deo vozila",
            },
            {
                path: attempt.BackTruckPath,
                label: "Zadnji deo vozila",
                alt: "Pogled na zadnji deo vozila",
            },
            {
                path: attempt.DashboardPath,
                label: "Kontrolna tabla",
                alt: "Pogled na kontrolnu tablu",
            },
        ].filter((img) => img.path)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Button onClick={handleBack} variant="ghost" size="sm" className="mb-2 sm:mb-0 sm:mr-2">
                                <ArrowLeft className="h-4 w-4 mr-2"/>
                                Nazad
                            </Button>
                            <div
                                className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <h1 className="text-2xl font-bold truncate">{user.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}
                                               className="w-fit">
                                            <Shield className="h-3 w-3 mr-1"/>
                                            {user.role}
                                        </Badge>
                                        {user.hourly_rate && (
                                            <Badge variant="outline" className="w-fit">
                                                <DollarSign className="h-3 w-3 mr-1"/>{user.hourly_rate}/sat
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground truncate">{user.username}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="w-full sm:w-auto">
                                <DatePickerWithRange
                                    className="w-full"
                                    selected={localDateRange}
                                    onSelectAction={(range) => {
                                        if (range?.from && range?.to) {
                                            setLocalDateRange(range)
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center gap-2 w-full sm:w-auto"
                            >
                                {isExporting ? (
                                    <>
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                        <span className="hidden sm:inline">Izvozi se...</span>
                                        <span className="sm:hidden">Izvoz...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4"/>
                                        <span className="hidden sm:inline">Izvozi podatke korisnika</span>
                                        <span className="sm:hidden">Izvoz</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-primary">{analytics.totalSessions}</div>
                                <div className="text-sm text-muted-foreground">Ukupno sesija</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div
                                    className="text-3xl font-bold text-primary">{formatDuration(analytics.totalDuration)}</div>
                                <div className="text-sm text-muted-foreground">Ukupno vreme</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-primary">{Math.round(analytics.successRate)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Stopa uspeha</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div
                                    className="text-3xl font-bold text-primary truncate">{analytics.mostActiveDay}</div>
                                <div className="text-sm text-muted-foreground">Najaktivniji dan</div>
                            </CardContent>
                        </Card>
                        {user.hourly_rate && (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div
                                        className="text-3xl font-bold text-green-600">{potentialEarnings.toFixed(2)} RSD
                                    </div>
                                    <div className="text-sm text-muted-foreground">Potencijalna zarada</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Earnings Breakdown (if hourly_rate exists) */}
                    {user.hourly_rate && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5"/>
                                    Pregled zarade
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                    <div className="text-center p-6 border rounded-lg">
                                        <div className="text-xl font-semibold text-green-600">
                                            {((analytics.todayStats.duration / 3600) * user.hourly_rate).toFixed(2)} RSD
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">Današnja zarada</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDuration(analytics.todayStats.duration)} rada
                                        </div>
                                    </div>
                                    <div className="text-center p-6 border rounded-lg">
                                        <div className="text-xl font-semibold text-green-600">
                                            {((analytics.weekStats.duration / 3600) * user.hourly_rate).toFixed(2)} RSD
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">Ova nedelja</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDuration(analytics.weekStats.duration)} rada
                                        </div>
                                    </div>
                                    <div className="text-center p-6 border rounded-lg">
                                        <div className="text-xl font-semibold text-green-600">
                                            {((analytics.monthStats.duration / 3600) * user.hourly_rate).toFixed(2)} RSD
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">Ovaj mesec</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDuration(analytics.monthStats.duration)} rada
                                        </div>
                                    </div>
                                    <div className="text-center p-6 border rounded-lg bg-accent">
                                        <div className="text-xl font-semibold ">{user.hourly_rate} RSD/sat</div>
                                        <div className="text-sm text-muted-foreground mt-2">Satnica</div>
                                        <div className="text-xs text-muted-foreground">Trenutna stopa</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Time Period Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5"/>
                                Analiza vremenskog perioda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="text-center p-6 border rounded-lg">
                                    <div className="text-xl font-semibold">Danas</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{analytics.todayStats.sessions} sesija
                                    </div>
                                    <div
                                        className="text-sm text-muted-foreground">{formatDuration(analytics.todayStats.duration)}</div>
                                </div>
                                <div className="text-center p-6 border rounded-lg">
                                    <div className="text-xl font-semibold">Ova nedelja</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{analytics.weekStats.sessions} sesija
                                    </div>
                                    <div
                                        className="text-sm text-muted-foreground">{formatDuration(analytics.weekStats.duration)}</div>
                                </div>
                                <div className="text-center p-6 border rounded-lg">
                                    <div className="text-xl font-semibold">Ovaj mesec</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{analytics.monthStats.sessions} sesija
                                    </div>
                                    <div
                                        className="text-sm text-muted-foreground">{formatDuration(analytics.monthStats.duration)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Pattern Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5"/>
                                Nedeljni obrazac
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota", "Nedelja"].map((day, index) => {
                                    const englishDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                                    const dayData = analytics.dailyStats[englishDays[index]] || {sessions: 0, duration: 0}
                                    const maxDuration = Math.max(...Object.values(analytics.dailyStats).map((d) => d.duration), 1)
                                    const percentage = (dayData.duration / maxDuration) * 100
                                    const dayEarnings = user.hourly_rate ? (dayData.duration / 3600) * user.hourly_rate : 0

                                    return (
                                        <div key={day} className="flex items-center gap-4">
                                            <div className="w-24 text-sm font-medium">{day}</div>
                                            <div className="flex-1 bg-secondary rounded-full h-3">
                                                <div
                                                    className="bg-primary h-3 rounded-full transition-all duration-500"
                                                    style={{width: `${percentage}%`}}
                                                />
                                            </div>
                                            <div
                                                className="text-sm text-muted-foreground w-24 text-right">{dayData.sessions} sesija
                                            </div>
                                            <div className="text-sm text-muted-foreground w-20 text-right">
                                                {formatDuration(dayData.duration)}
                                            </div>
                                            {user.hourly_rate && (
                                                <div className="text-sm text-green-600 w-16 text-right font-medium">
                                                    {dayEarnings.toFixed(0)} RSD
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5"/>
                                Aktivnost u poslednjih 7 dana
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-3">
                                {analytics.recentActivity.map((day, index) => {
                                    const dayEarnings = user.hourly_rate ? (day.duration / 3600) * user.hourly_rate : 0
                                    return (
                                        <div key={index}
                                             className="text-center p-4 border rounded-lg hover:bg-accent transition-colors">
                                            <div className="text-xs font-medium text-muted-foreground">{day.date}</div>
                                            <div className="text-xl text-primary font-bold mt-1">{day.sessions}</div>
                                            <div
                                                className="text-xs text-muted-foreground">{formatDuration(day.duration)}</div>
                                            {user.hourly_rate && (
                                                <div
                                                    className="text-xs text-green-600 font-medium mt-1">{dayEarnings.toFixed(0)}</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Records */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5"/>
                                Rekordne sesije
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-accent rounded-lg">
                                    <div className="text-xl font-semibold">Najduža sesija</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{formatDuration(analytics.longestSession)}</div>
                                </div>
                                <div className="text-center p-6 bg-accent rounded-lg">
                                    <div className="text-xl font-semibold">Prosečna sesija</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{formatDuration(analytics.averageSession)}</div>
                                </div>
                                <div className="text-center p-6 bg-accent rounded-lg">
                                    <div className="text-xl font-semibold">Najkraća sesija</div>
                                    <div
                                        className="text-sm text-muted-foreground mt-2">{formatDuration(analytics.shortestSession)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5"/>
                                Nedavne sesije
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {recentSessions.length > 0 ? (
                                    recentSessions.map((session) => {
                                        const sessionEarnings = user.hourly_rate ? (session.duration / 3600) * user.hourly_rate : 0
                                        return (
                                            <div
                                                key={session.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-2"
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-medium">{formatDate(session.clockIn)}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatTime(session.clockIn)} - {formatTime(session.clockOut)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="w-fit">
                                                        {formatDuration(session.duration)}
                                                    </Badge>
                                                    {user.hourly_rate && (
                                                        <Badge variant="outline" className="w-fit text-green-600">
                                                            {sessionEarnings.toFixed(2)} RSD
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                                        <p>Nema pronađenih sesija</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clock Attempts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5"/>
                                Pokušaji prijave
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {recentAttempts.length > 0 ? (
                                    recentAttempts.map((attempt) => (
                                        <div
                                            key={attempt.id}
                                            onClick={() => handleAttemptClick(attempt)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-2 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {attempt.success ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0"/>
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0"/>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-medium">Prijava {attempt.type}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(attempt.timestamp)} u {formatTime(attempt.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={attempt.success ? "default" : "destructive"}
                                                       className="w-fit">
                                                    {attempt.success ? "Uspešno" : "Neuspešno"}
                                                </Badge>
                                                <Camera className="h-4 w-4 text-muted-foreground"/>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                                        <p>Nema pronađenih pokušaja prijave</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Attempt Details Drawer */}
            <Drawer open={isAttemptDrawerOpen} onOpenChange={setIsAttemptDrawerOpen}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="flex items-center gap-3">
                                {selectedAttempt?.success ? (
                                    <CheckCircle className="h-5 w-5 text-green-500"/>
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500"/>
                                )}
                                Detalji pokušaja prijave {selectedAttempt?.type}
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="sm">
                                    <X className="h-4 w-4"/>
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>
                    <div className="p-6 overflow-y-auto">
                        {selectedAttempt && (
                            <div className="space-y-6">
                                {/* Attempt Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Informacije o pokušaju</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Badge variant={selectedAttempt.success ? "default" : "destructive"}>
                                                    {selectedAttempt.success ? "Uspešno" : "Neuspešno"}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tip:</span>
                                                <span className="font-medium">Clock {selectedAttempt.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Datum:</span>
                                                <span
                                                    className="font-medium">{formatDate(selectedAttempt.timestamp)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Vreme:</span>
                                                <span
                                                    className="font-medium">{formatTime(selectedAttempt.timestamp)}</span>
                                            </div>
                                            {selectedAttempt.location && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Lokacija:</span>
                                                    <span className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3"/>
                                                        {selectedAttempt.location}
                          </span>
                                                </div>
                                            )}
                                            {selectedAttempt.notes && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-muted-foreground">Napomene:</span>
                                                    <span
                                                        className="text-sm bg-muted p-2 rounded">{selectedAttempt.notes}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Informacije o korisniku</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Ime:</span>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Korisničko ime:</span>
                                                <span className="font-medium">{user.username}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Uloga:</span>
                                                <Badge
                                                    variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                                            </div>
                                            {user.hourly_rate && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Satnica:</span>
                                                    <Badge variant="outline" className="text-green-600">
                                                        {user.hourly_rate} RSD/sat
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">ID korisnika:</span>
                                                <span className="font-mono text-sm">{user.id}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                {user.role === "teren" && (
                                    <>
                                        {/* Images */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <ImageIcon className="h-5 w-5"/>
                                                    Uploaded Images
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {getAttemptImages(selectedAttempt).map((image, index) => (
                                                        <div key={index} className="space-y-2">
                                                            <div
                                                                className="aspect-square bg-muted rounded-lg overflow-hidden">
                                                                <img
                                                                    src={image.path}
                                                                    alt={image.alt || "Nema slike"}
                                                                    className="object-cover w-full h-full"
                                                                    width={500}
                                                                    height={300}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "/noimage.jpeg"
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-medium">{image.label}</p>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mt-1 bg-transparent"
                                                                    onClick={() => window.open(image.path, "_blank")}
                                                                    disabled={!image.path}
                                                                >
                                                                    Vidi sliku u celosti
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {getAttemptImages(selectedAttempt).length === 0 && (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                                                        <p>Nema zabelezenih slika</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
