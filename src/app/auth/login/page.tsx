"use client";

import { FormEvent, useState } from "react";
import {signIn, useSession} from "next-auth/react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { useNotifier } from "@/app/hooks/useNotifications";
import {useRouter} from "next/navigation";
import LoadSpinner from "@/components/LoadSpinner";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotifier();
    const router = useRouter();
    const session = useSession()
    if(session?.data?.user) router.push("/clocktime")
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn("credentials", {
            username,
            password
        });


        if (result?.error) {
            notifyError("Error", result.error);
        } else {
            notifySuccess("Success", "Uspesna prijava");
            setIsLoading(false);
        }
        setIsLoading(false);
        router.push("/clocktime");

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
                            placeholder: "Korisnicko ime",
                            value: username,
                            setValue: setUsername,
                        },
                        {
                            type: "password",
                            placeholder: "Sifra",
                            value: password,
                            setValue: setPassword,
                        },
                    ]}
                    onSubmitAction={handleLogin}
                    submitText="Prijavi se"
                />
            </LoadSpinner>
        </AuthCard>
    );
};

export default LoginPage;
