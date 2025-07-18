"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { useUsers } from "../hooks/useUsers"
import {getUserStats, processUserSessions} from "@/lib/data-processing";
import {ExportControls} from "@/app/admin/_components/export-controls";
import {SessionsTab} from "@/app/admin/_components/sessions-tab";
import {AttemptsTab} from "@/app/admin/_components/attempts-tab";
import {UserCard} from "@/app/admin/_components/user-card";
import {UserDetailModal} from "@/app/admin/_components/user-detail-modal";
import {StatsOverview} from "@/app/admin/_components/stats-overview";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import RegisterModal from "@/app/admin/_components/register/RegisterModal";
import {AdminSkeleton} from "@/app/admin/_components/admin-skeleton";

export default function Admin() {
    const { users, isLoading } = useUsers()
    const session =  useSession()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUserForModal, setSelectedUserForModal] = useState(null)
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    })

    if(!session) redirect("/login");

    if(session?.data?.user.role !== "admin")
    {
        redirect("/clocktime")
    }

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [users, searchTerm])

    const allProcessedSessions = useMemo(() => {
        return users.flatMap((user) => processUserSessions(user))
    }, [users])

    const overallStats = useMemo(() => {
        const totalSessions = allProcessedSessions.length
        const totalDuration = allProcessedSessions.reduce((sum, session) => sum + session.duration, 0)
        const totalAttempts = users.reduce((sum, user) => sum + user.clockAttempts.length, 0)
        const successfulAttempts = users.reduce(
            (sum, user) => sum + user.clockAttempts.filter((attempt) => attempt.success).length,
            0,
        )

        return {
            totalUsers: users.length,
            totalSessions,
            totalDuration,
            totalAttempts,
            successfulAttempts,
            failedAttempts: totalAttempts - successfulAttempts,
            averageSession: totalSessions > 0 ? totalDuration / totalSessions : 0,
        }
    }, [users, allProcessedSessions])

    const handleUserClick = (user) => {
        setSelectedUserForModal(user)
        setIsUserModalOpen(true)
    }

    if (isLoading) {
        return <AdminSkeleton />
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage users and monitor work sessions</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Dodaj novog korisnika</Button>
                    </DialogTrigger>
                    <DialogTitle>
                    </DialogTitle>
                    <DialogContent className="max-w-2xl overflow-auto max-h-[90vh]">
                        <RegisterModal />
                    </DialogContent>
                </Dialog>
                <ExportControls users={users} dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>

            <StatsOverview stats={overallStats} />

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="users">Users Overview</TabsTrigger>
                    <TabsTrigger value="sessions">All Sessions</TabsTrigger>
                    <TabsTrigger value="attempts">Clock Attempts</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredUsers.map((user) => {
                            const stats = getUserStats(user)
                            return <UserCard key={user.id} user={user} stats={stats} onClick={() => handleUserClick(user)} />
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="sessions">
                    <SessionsTab users={users} />
                </TabsContent>

                <TabsContent value="attempts">
                    <AttemptsTab users={users} />
                </TabsContent>
            </Tabs>

            <UserDetailModal
                user={selectedUserForModal}
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                dateRange={dateRange}
            />
        </div>
    )
}
