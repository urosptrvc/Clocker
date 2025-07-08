"use client";

import { FormEvent, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useNotifier } from "@/app/hooks/useNotifications";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import LoadSpinner from "@/components/LoadSpinner";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

type RegisterModalProps = {
    onSuccess?: () => void;
};

const RegisterModal = ({ onSuccess }: RegisterModalProps) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const { notifyError, notifySuccess } = useNotifier();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, name, role }),
        });

        const data = await res.json();
        setIsLoading(false);

        if (!res.ok) {
            notifyError("Greška", data.error);
            return;
        }

        notifySuccess("Uspeh", "Korisnik je uspešno registrovan");
        if (onSuccess) onSuccess();
    };

    return (
        <div>
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <Image src="/logo.png" alt="Logo" width={50} height={50} />
                </div>
                <CardTitle className="text-center">Registruj novog korisnika</CardTitle>
            </CardHeader>

            <CardContent>
                <LoadSpinner isLoading={isLoading}>
                    <AuthForm
                        fields={[
                            {
                                type: "text",
                                placeholder: "Ime i prezime",
                                value: name,
                                setValue: setName,
                            },
                            {
                                type: "username",
                                placeholder: "Korisnicko ime",
                                value: username,
                                setValue: setUsername,
                            },
                            {
                                type: "password",
                                placeholder: "Lozinka",
                                value: password,
                                setValue: setPassword,
                            },
                        ]}
                        extraFields={
                            <Select onValueChange={setRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Odaberi ulogu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Korisnik</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        onSubmitAction={handleRegister}
                        submitText="Registruj"
                    />
                </LoadSpinner>
            </CardContent>

            <CardFooter className="flex items-center justify-center">
                <DialogClose asChild>
                    <Button variant="ghost" className="text-sm">
                        Zatvori kreiranje korisnika
                    </Button>
                </DialogClose>
            </CardFooter>
        </div>
    );
};

export default RegisterModal;
