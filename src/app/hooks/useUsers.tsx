"use client"

import { useState, useEffect } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useNotifier } from "@/app/hooks/useNotifications";

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const { apiGet } = useApi();
    const { notifyError } = useNotifier();

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const result = await apiGet("/api/users");
            if (result) {
                setUsers(result)
            }
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchUser(id) {
        setIsLoading(true);
        try {
            const result = await apiGet(`/api/users/${id}`);
            if (result) {
                setUser(result)
            }
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            setUser(undefined);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        users,
        fetchUsers,
        isLoading,
        fetchUser,
        user
    };
}
