"use client"

import { useState, useMemo } from "react" // Added useEffect
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useUsers } from "../hooks/useUsers"
import { getUserStats, processUserSessions } from "@/lib/data-processing"
import { ExportControls } from "@/app/admin/_components/export-controls"
import { SessionsTab } from "@/app/admin/_components/sessions-tab"
import { AttemptsTab } from "@/app/admin/_components/attempts-tab"
import { UserCard } from "@/app/admin/_components/user-card"
import { StatsOverview } from "@/app/admin/_components/stats-overview"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import RegisterModal from "@/app/admin/_components/register/RegisterModal"
import { AdminSkeleton } from "@/app/admin/_components/admin-skeleton"
import { getUserAnalytics } from "@/lib/userAnalytics"

export default function Admin() {
    const router = useRouter()
    const { users, isLoading } = useUsers()
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    })

    const filteredUsers = useMemo(() => {
        return users.filter((managedUser) => {
            const matchesSearch =
                managedUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                managedUser.username.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesRole = roleFilter === "all" || managedUser.role === roleFilter
            return matchesSearch && matchesRole
        })
    }, [users, searchTerm, roleFilter])

    const allProcessedSessions = useMemo(() => {
        return users.flatMap((managedUser) => processUserSessions(managedUser))
    }, [users])

    const overallStats = useMemo(() => {
        const totalSessions = allProcessedSessions.length
        const totalAttempts = users.reduce((sum, managedUser) => sum + managedUser.clockAttempts.length, 0)
        const successfulAttempts = users.reduce(
            (sum, managedUser) => sum + managedUser.clockAttempts.filter((attempt) => attempt.success).length,
            0
        )
        return {
            totalUsers: users.length,
            totalSessions,
            totalAttempts,
            successfulAttempts,
        }
    }, [users, allProcessedSessions])

    const handleUserClick = (managedUser) => {
        router.push(`/admin/${managedUser.id}`)
    }

    const analyticsUsers = users.map((managedUser) => getUserAnalytics(managedUser, dateRange)) // Fixed typo: analsUsers -> analyticsUsers

    const roleStats = useMemo(() => {
        return {
            admin: users.filter((managedUser) => managedUser.role === "admin").length,
            teren: users.filter((managedUser) => managedUser.role === "teren").length,
            kancelarija: users.filter((managedUser) => managedUser.role === "kancelarija").length,
            mehanicar: users.filter((managedUser) => managedUser.role === "mehanicar").length,
        }
    }, [users])

    if (isLoading) {
        return <AdminSkeleton />
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground">Upravljajte korisnicima i pratite radne sesije</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Dodaj novog korisnika</Button>
                    </DialogTrigger>
                    <DialogTitle></DialogTitle>
                    <DialogContent className="max-w-2xl overflow-auto max-h-[90vh]">
                        <RegisterModal />
                    </DialogContent>
                </Dialog>
                <ExportControls users={users} analsUsers={analyticsUsers} dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>

            <StatsOverview stats={overallStats} />

            {/* Role Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Admin</p>
                            <p className="text-2xl font-bold">{roleStats.admin}</p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Teren</p>
                            <p className="text-2xl font-bold">{roleStats.teren}</p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Kancelarija</p>
                            <p className="text-2xl font-bold">{roleStats.kancelarija}</p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="users">Pregled korisnika</TabsTrigger>
                    <TabsTrigger value="sessions">Sve sesije</TabsTrigger>
                    <TabsTrigger value="attempts">Pokušaji prijavljivanja</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Pretraži korisnike po imenu ili mejlu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Filtriraj po ulozi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Sve uloge</SelectItem>
                                    <SelectItem value="admin">Admin ({roleStats.admin})</SelectItem>
                                    <SelectItem value="teren">Teren ({roleStats.teren})</SelectItem>
                                    <SelectItem value="kancelarija">Kancelarija ({roleStats.kancelarija})</SelectItem>
                                    <SelectItem value="mehanicar">Mehanicar ({roleStats.mehanicar})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filter Summary */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Prikazano {filteredUsers.length} od {users.length} korisnika
            </span>
                        {roleFilter !== "all" && <span className="bg-secondary px-2 py-1 rounded-md">Uloga: {roleFilter}</span>}
                        {searchTerm && <span className="bg-secondary px-2 py-1 rounded-md">Pretraga: &#34;{searchTerm}&#34;</span>}
                    </div>

                    <div className="grid gap-4">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((managedUser) => {
                                const stats = getUserStats(managedUser)
                                return (
                                    <UserCard
                                        key={managedUser.id}
                                        user={managedUser}
                                        stats={stats}
                                        onClickAction={() => handleUserClick(managedUser)}
                                    />
                                )
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Nema korisnika koji odgovaraju filterima.</p>
                                {(searchTerm || roleFilter !== "all") && (
                                    <Button
                                        variant="outline"
                                        className="mt-2 bg-transparent"
                                        onClick={() => {
                                            setSearchTerm("")
                                            setRoleFilter("all")
                                        }}
                                    >
                                        Obriši filtere
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="sessions">
                    <SessionsTab users={users} />
                </TabsContent>

                <TabsContent value="attempts">
                    <AttemptsTab users={users} />
                </TabsContent>
            </Tabs>
        </div>
    )
}