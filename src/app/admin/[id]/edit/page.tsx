"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {ArrowLeft, UserIcon, Trash2} from "lucide-react"
import {useUsers} from "@/app/hooks/useUsers"
import {useNotifier} from "@/app/hooks/useNotifications"

type UserFormData = {
    name: string
    username: string
    role: string
    hourly_rate: number | null
    password?: string
    extended_rate: number | null
}

export default function UserEditAndDelete() {
    const params = useParams()
    const router = useRouter()
    const {user, isLoading, updateUser, deleteUser, fetchUser} = useUsers()
    const {notifySuccess, notifyError} = useNotifier()
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        username: "",
        role: "",
        hourly_rate: null,
        password: "",
        extended_rate: null,
    })
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchUser(params.id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                username: user.username,
                role: user.role,
                hourly_rate: user.hourly_rate || null,
                password: "",
                extended_rate: user.extended_rate || null,
            })
        }
    }, [user])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "hourly_rate" ? (value ? parseFloat(value) : null) : value,
        }))
    }

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({...prev, role: value}))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            // Create a copy of formData without sending empty password
            const submitData = {...formData}
            if (!submitData.password) {
                delete submitData.password
            }
            await updateUser(params.id, submitData)
            notifySuccess("Korisnik je uspešno ažuriran")
            router.push(`/admin/${params.id}`)
        } catch (error) {
            notifyError("Ažuriranje korisnika nije uspelo", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await deleteUser(params.id)
            notifySuccess("Korisnik je uspešno obrisan")
            router.push("/admin")
        } catch (error) {
            notifyError("Brisanje korisnika nije uspelo", error)
        } finally {
            setIsSubmitting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    const handleCancel = () => {
        router.push(`/admin/${params.id}`)
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Card>
                    <CardContent>
                        <div className="container mx-auto px-4 py-6 pt-10">
                            <div
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <Button onClick={handleCancel} variant="ghost" size="sm"
                                            className="mb-2 sm:mb-0 sm:mr-2">
                                        <ArrowLeft className="h-4 w-4 mr-2"/>
                                        Nazad
                                    </Button>
                                    <div
                                        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="h-6 w-6 text-primary"/>
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-2xl font-bold truncate">Uredi korisnika: {user.name}</h1>
                                        <p className="text-muted-foreground truncate">{user.username}</p>
                                    </div>
                                </div>
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="flex items-center gap-2">
                                            <Trash2 className="h-4 w-4"/>
                                            Obriši korisnika
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Potvrda brisanja</DialogTitle>
                                            <DialogDescription>
                                                Da li ste sigurni da želite da obrišete korisnika &#34;{user.name}&#34;?
                                                Ova akcija je nepovratna.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                                Otkaži
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div
                                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                        Briše se...
                                                    </>
                                                ) : (
                                                    "Obriši"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Uredi detalje korisnika</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Ime</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Korisničko ime</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Lozinka (ostavite prazno ako ne menjate)</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Unesi novu lozinku"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Uloga</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Izaberi ulogu"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="teren">Teren</SelectItem>
                                            <SelectItem value="user">Korisnik</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hourly_rate">Satnica (RSD/sat)</Label>
                                    <Input
                                        id="hourly_rate"
                                        name="hourly_rate"
                                        type="number"
                                        value={formData.hourly_rate || ""}
                                        onChange={handleInputChange}
                                        placeholder="Unesi satnicu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hourly_rate">Satnica (RSD/sat)</Label>
                                    <Input
                                        id="extended_rate"
                                        name="extended_rate"
                                        type="number"
                                        value={formData.extended_rate || ""}
                                        onChange={handleInputChange}
                                        placeholder="Unesi prekovremenu satnicu"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Otkaži
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                            Čuva se...
                                        </>
                                    ) : (
                                        "Sačuvaj promene"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}