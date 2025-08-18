"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {
    Clock,
    TrendingUp,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Timer,
    Target,
    Activity,
    MapPin,
    Briefcase,
    ImageIcon, ArrowLeft, Shield, Download, Pencil,
} from "lucide-react"
import {Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer"
import {useEffect, useState} from "react"
import {X} from "lucide-react"
import {Button} from "@/components/ui/button"
import {useParams, useRouter} from "next/navigation"
import {getUserAnalytics} from "@/lib/userAnalytics";
import {useUsers} from "@/app/hooks/useUsers";
import {DatePickerWithRange} from "@/components/ui/date-range-picker";
import {formatDate, formatDuration, formatTime} from "@/lib/helper";
import {translateDayToSerbian} from "@/lib/translate";
import {exportAnalyticsToExcel} from "@/lib/excel-export-utils";
import {useNotifier} from "@/app/hooks/useNotifications";

type DateRange = {
    from: Date
    to?: Date
}
export default function AnalyticsDashboard() {
    const params = useParams()
    const router = useRouter()
    const {notifySuccess, notifyError} = useNotifier()
    const [Exporting, setExporting] = useState<boolean>(false);
    const [selectedAttempt, setSelectedAttempt] = useState(null)
    const [isAttemptDrawerOpen, setIsAttemptDrawerOpen] = useState(false)
    const [localDateRange, setLocalDateRange] = useState<DateRange>({
        from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    })
    const {user, isLoading, fetchUser} = useUsers()
    useEffect(() => {
        if (params.id) {
            fetchUser(params.id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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
    const anals = getUserAnalytics(user, localDateRange)
    const handleAttemptClick = (attempt) => {
        setSelectedAttempt(attempt)
        setIsAttemptDrawerOpen(true)
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

    const handleRedirect = () => {
        setExporting(true)
        router.push("/admin");
        setExporting(false)
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const result = await exportAnalyticsToExcel({
                user,
                anals,
                dateRange: localDateRange,
            })

            if (result.success) {
                notifySuccess(`Excel fajl je uspešno izvezen: ${result.filename}`)
            } else {
                notifyError("Izvoz nije uspeo:", result.error)
            }
        } catch (error) {
            notifyError("Izvoz nije uspeo:", error)
        } finally {
            setExporting(false)
        }
    }

    const handleEdit = () => {
        router.push(`/admin/${params.id}/edit`)
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <Card>
                    <CardContent>
                        <div className="container mx-auto px-4 py-6 pt-10">
                            <div
                                className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <Button onClick={handleRedirect} variant="ghost" size="sm"
                                            className="mb-2 sm:mb-0 sm:mr-2">
                                        <ArrowLeft className="h-4 w-4 mr-2"/>
                                        Nazad
                                    </Button>
                                    <div
                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {user.name
                                            .split(' ')
                                            .map(word => word.charAt(0).toUpperCase())
                                            .join('')
                                            .slice(0, 2)}
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
                                        disabled={Exporting}
                                        className="flex items-center gap-2 w-full sm:w-auto"
                                    >
                                        {Exporting ? (
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
                                    <Button
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 w-full sm:w-auto"
                                    >
                                        <Pencil className="h-4 w-4"/>
                                        <span className="hidden sm:inline">Uredi korisnika</span>
                                        <span className="sm:hidden">Uredi</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ukupno sesija</p>
                                    <p className="text-3xl font-bold">{anals.totalSessions}</p>
                                </div>
                                <Briefcase className="h-8 w-8 text-blue-500"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ukupno vreme</p>
                                    <p className="text-3xl font-bold">{formatDuration(anals.totalDuration / 60)}</p>
                                </div>
                                <Clock className="h-8 w-8 text-green-500"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Stopa uspeha</p>
                                    <p className="text-3xl font-bold">{Math.round(anals.overallSuccessRate)}%</p>
                                </div>
                                <Target className="h-8 w-8 text-orange-500"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ukupna zarada</p>
                                    <p className="text-3xl font-bold">{Math.round(anals.totalEarnings)} RSD</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5"/>
                                Redovna zarada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{Math.round(anals.regularEarnings)} RSD
                            </div>
                            <p className="text-sm text-muted-foreground">{formatDuration(anals.totalRegular / 60)} redovnog
                                rada</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5"/>
                                Prekovremena zarada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold text-orange-600">{Math.round(anals.overtimeEarnings)} RSD
                            </div>
                            <p className="text-sm text-muted-foreground">{formatDuration(anals.totalOvertime / 60)} prekovremenog
                                rada</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5"/>
                                Procenat prekovremenih
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{anals.overtimePercentage.toFixed(1)}%
                            </div>
                            <p className="text-sm text-muted-foreground">od ukupnog vremena rada</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Session Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prosečna sesija</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold">{formatDuration(anals.averageSessionDuration / 60)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Najduža sesija</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(anals.longestSession / 60)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Najkraća sesija</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(anals.shortestSession / 60)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5"/>
                            Nedeljni pregled
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(anals.dailyStats).map(([day, stats]: any) => {
                                const maxDuration = Math.max(...Object.values(anals.dailyStats).map((d: any) => d.duration))
                                const percentage = maxDuration > 0 ? (stats.duration / maxDuration) * 100 : 0

                                return (
                                    <div key={day} className="flex items-center gap-4">
                                        <div className="w-24 text-sm font-medium">{translateDayToSerbian(day)}</div>
                                        <div className="flex-1 bg-secondary rounded-full h-3">
                                            <div
                                                className="bg-primary h-3 rounded-full transition-all duration-500"
                                                style={{width: `${percentage}%`}}
                                            />
                                        </div>
                                        <div
                                            className="text-sm text-muted-foreground w-20 text-right">{stats.sessions} sesija
                                        </div>
                                        <div className="text-sm text-muted-foreground w-24 text-right">
                                            {formatDuration(stats.duration / 60)}
                                        </div>
                                        <div className="text-sm text-green-600 w-20 text-right font-medium">
                                            {Math.round(stats.earnings)} RSD
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Clock Attempts Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5"/>
                                Analiza pokušaja prijave
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Ukupno pokušaja</span>
                                <Badge variant="outline">{anals.totalAttempts}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Uspešni pokušaji</span>
                                <Badge variant="default" className="bg-green-500">
                                    {anals.successfulAttempts}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Neuspešni pokušaji</span>
                                <Badge variant="destructive">{anals.failedAttempts}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Stopa uspeha</span>
                                <Badge variant="secondary">{Math.round(anals.overallSuccessRate)}%</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5"/>
                                Detaljne stope uspeha
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Clock IN pokušaji</span>
                                <Badge variant="outline">{anals.clockInAttempts}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Clock IN uspešnost</span>
                                <Badge variant="default" className="bg-blue-500">
                                    {Math.round(anals.clockInSuccessRate)}%
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Clock OUT pokušaji</span>
                                <Badge variant="outline">{anals.clockOutAttempts}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Clock OUT uspešnost</span>
                                <Badge variant="default" className="bg-orange-500">
                                    {Math.round(anals.clockOutSuccessRate)}%
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5"/>
                            Aktivnost u poslednjih 7 dana
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-3">
                            {anals.recentActivity.map((day, index) => (
                                <div key={index}
                                     className="text-center p-4 border rounded-lg hover:bg-accent transition-colors">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">
                                        {day.date.split("-").slice(1).join("/")}
                                    </div>
                                    <div className="text-xl font-bold text-primary mb-1">{day.sessions}</div>
                                    <div
                                        className="text-xs text-muted-foreground mb-1">{formatDuration(day.duration / 60)}</div>
                                    <div className="text-xs text-green-600 font-medium">{Math.round(day.earnings)} RSD
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">{Math.round(day.successRate)}% uspeh
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Najaktivniji dan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold text-green-600">{translateDayToSerbian(anals.mostActiveDay)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Najmanje aktivan dan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold text-orange-600">{translateDayToSerbian(anals.leastActiveDay)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Najproduktivniji dan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold text-blue-600">{translateDayToSerbian(anals.mostProductiveDay)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Attempts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5"/>
                            Poslednji pokušaji prijave
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {anals.filteredAttempts.slice(0, 10).map((attempt) => (
                                <div
                                    key={attempt.id}
                                    onClick={() => handleAttemptClick(attempt)}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        {attempt.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-500"/>
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500"/>
                                        )}
                                        <div>
                                            <div className="font-medium">Clock {attempt.type}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(attempt.timestamp)} u {formatTime(attempt.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {attempt.location && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3"/>
                                                {attempt.location}
                                            </Badge>
                                        )}
                                        <Badge variant={attempt.success ? "default" : "destructive"}>
                                            {attempt.success ? "Uspešno" : "Neuspešno"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

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
                                                    <Badge
                                                        variant={selectedAttempt.success ? "default" : "destructive"}>
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
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Satnica:</span>
                                                        <Badge variant="outline" className="text-green-600">
                                                            {user.hourly_rate || 0} RSD/sat
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Prekovremena satnica:</span>
                                                        <Badge variant="outline" className="text-orange-600">
                                                            {user.extended_rate || 0} RSD/sat
                                                        </Badge>
                                                    </div>
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
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={image.path || "/placeholder.svg"}
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
        </div>
    )
}
