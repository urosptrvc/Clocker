import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useSession} from "next-auth/react";
import React from "react";

const AdminPanel = () => {
    const {data: session} = useSession();

    const isAdmin = session?.user?.role === "admin";

    if (!isAdmin) {
        return null;
    }

    return (
        <Link href="/admin">
            <Button variant="ghost" className="text-sm">
                Admin Panel
            </Button>
        </Link>
    );
}

export default AdminPanel;
