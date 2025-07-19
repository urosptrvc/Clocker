"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/select"
import {Loader2, Upload, X} from "lucide-react"
import {useNotifier} from "@/app/hooks/useNotifications"

const predefinedLocations = [
    {value: "ftncacak", label: "Fakultet Tehničkih Nauka u Čačku"},
    {value: "ukg", label: "Univerzitet u Kragujevcu"},
]

export function ClockInFormField({
                                     load,
                                     setLocation,
                                     notes,
                                     setNotes,
                                     onSubmit,
                                     setFront,
                                     setBack,
                                     setMileage,
                                     front,
                                     back,
                                     mileage
                                 }) {
    const [customLocation, setCustomLocation] = useState("")
    const [isCustom, setIsCustom] = useState(false)
    const {notifyError} = useNotifier()

    const handleLocationChange = (value) => {
        if (value === "custom") {
            setIsCustom(true)
            setLocation("")
        } else {
            setIsCustom(false)
            setLocation(value)
        }
    }

    const handleImageUpload = (file, setImage) => {
        if (file && file.type.startsWith("image/")) {
            setImage(file)
        } else {
            notifyError("Molimo izaberite validnu sliku")
        }
    }

    const removeImage = (setImage) => {
        setImage(null)
    }

    const ImageUploadField = ({label, image, setImage, id}) => (
        <div>
            <Label htmlFor={id} className="text-sm font-medium">
                {label} <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1">
                {!image ? (
                    <label
                        htmlFor={id}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400"/>
                            <p className="text-sm text-gray-500">Kliknite da otpremite sliku</p>
                            <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
                        </div>
                        <Input
                            id={id}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], setImage)}
                        />
                    </label>
                ) : (
                    <div className="relative">
                        <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={label}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(setImage)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()

                if (isCustom && notes.trim() === "") {
                    notifyError("Opis je obavezan kada je lokacija rucno unesena")
                    return
                }

                if (!front) {
                    notifyError("Slika prednje strane kamiona je obavezna")
                    return
                }
                if (!back) {
                    notifyError("Slika zadnje strane kamiona je obavezna")
                    return
                }
                if (!mileage) {
                    notifyError("Slika kilometraže je obavezna")
                    return
                }

                onSubmit(e)
            }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="location">Lokacija</Label>
                    <Select onValueChange={handleLocationChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Izaberite lokaciju"/>
                        </SelectTrigger>
                        <SelectContent>
                            {predefinedLocations.map((loc) => (
                                <SelectItem key={loc.value} value={loc.value}>
                                    {loc.label}
                                </SelectItem>
                            ))}
                            <SelectItem value="custom">Drugo (rucni unos)</SelectItem>
                        </SelectContent>
                    </Select>
                    {isCustom && (
                        <Input
                            className="mt-2"
                            value={customLocation}
                            onChange={(e) => {
                                setCustomLocation(e.target.value)
                                setLocation(e.target.value)
                            }}
                            placeholder="Unesite lokaciju"
                            required
                        />
                    )}
                </div>
                <div>
                    <Label htmlFor="notes">Opis</Label>
                    <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                           placeholder="Unesite opis"/>
                </div>
            </div>

            {/* Slike */}
            <div className="space-y-4">
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Obavezne slike</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ImageUploadField
                            label="Prednja strana kamiona"
                            image={front}
                            setImage={setFront}
                            id="front-truck"
                        />
                        <ImageUploadField
                            label="Zadnja strana kamiona"
                            image={back}
                            setImage={setBack}
                            id="back-truck"
                        />
                        <ImageUploadField
                            label="Kilometraža na tabli"
                            image={mileage}
                            setImage={setMileage}
                            id="mileage"
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={load}>
                {load && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                Pocni radno vreme
            </Button>
        </form>
    )
}
