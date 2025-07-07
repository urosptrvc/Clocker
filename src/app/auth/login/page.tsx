"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { useNotifier } from "@/app/hooks/useNotifications";
import { useRouter } from "next/navigation";
import LoadSpinner from "@/components/LoadSpinner";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotifier();
    const router = useRouter();


    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setIsLoading(false);

        if (result?.error) {
            notifyError("Error", result.error);
        } else {
            notifySuccess("Success", "Login successful");
            router.push("/clocktime");
        }
    };

    return (
        <AuthCard
            title="Login"
            footerLink={{ href: "/auth/register", text: "Nemate nalog? Kliknite ovde da se registrujete" }}
        >
            <LoadSpinner isLoading={isLoading}>
                <AuthForm
                    fields={[
                        {
                            type: "email",
                            placeholder: "Email",
                            value: email,
                            setValue: setEmail,
                        },
                        {
                            type: "password",
                            placeholder: "Password",
                            value: password,
                            setValue: setPassword,
                        },
                    ]}
                    onSubmitAction={handleLogin}
                    submitText="Login"
                />
            </LoadSpinner>
        </AuthCard>
    );
};

export default LoginPage;
