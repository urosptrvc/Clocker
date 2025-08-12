import { ReactNode } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type Props = {
    title: string;
    children: ReactNode;
};

const AuthCard = ({ title, children }: Props) => {
    return (
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-xl border bg-card/50 p-6 shadow-lg backdrop-blur-[12px]"
            >
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="Logo" className="w-[50px] h-[50px]" />
                        </div>
                        <CardTitle className="text-center">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
            </motion.div>
        </div>
    );
};

export default AuthCard;
