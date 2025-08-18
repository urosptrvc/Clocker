"use client";

import { FormEvent, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { useNotifier } from "@/app/hooks/useNotifications";
import {useRouter} from "next/navigation";
import LoadSpinner from "@/components/LoadSpinner";
import {useApi} from "@/app/hooks/useApi";
import {useUserContext} from "@/context/UserContext";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {apiPost} = useApi();
    const {login} = useUserContext()
    const { notifyError, notifySuccess } = useNotifier();
    const router = useRouter();
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try{
            const result = await apiPost("/api/auth/login", {
                username,
                password
            });
            if (result?.error || !result?.token || !result?.user) {
                notifyError("Error", result.error);
                setIsLoading(false);
            } else {
                login(result.user,result.token)
                notifySuccess("Success", "Uspesna prijava");
                router.push("/clocktime");
            }
            setIsLoading(false);
        } catch(e) {
            notifyError("Error", e.message);
            setIsLoading(false);
        }

    };

    return (
        <AuthCard
            title="VS Energy Clocker"
        >
            <LoadSpinner isLoading={isLoading}>
                <AuthForm
                    fields={[
                        {
                            type: "username",
                            placeholder: "peraperic",
                            value: username,
                            setValue: setUsername,
                            label: "Korisnicko ime"
                        },
                        {
                            type: "password",
                            placeholder: "JakaSifra123",
                            value: password,
                            setValue: setPassword,
                            label: "Lozinka"
                        },
                    ]}
                    onSubmitAction={handleLogin}
                    submitText="Prijavi se" label={""}                />
            </LoadSpinner>
        </AuthCard>
    );
};

export default LoginPage;
