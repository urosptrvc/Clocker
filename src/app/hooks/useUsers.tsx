"use client"

import {useEffect, useState} from "react";
import {useApi} from "@/app/hooks/useApi";
import {useNotifier} from "@/app/hooks/useNotifications";

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const {apiGet, apiPatch, apiDelete} = useApi();
    const {notifyError} = useNotifier();

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const req = await apiGet("/api/users");
            const res = await req.json()
            if (res) {
                setUsers(res)
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
            const req = await apiGet(`/api/users/${id}`);
            const res = await req.json()
            if (res) {
                setUser(res)
            }
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Error", errorData.error);
            setUser(undefined);
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteUser(id) {
        setIsLoading(true);
        try {
            await apiDelete(`/api/users/${id}`);
            await fetchUsers();
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Greška prilikom brisanja", errorData.error);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateUser(id, data: any) {
        try {
            const req = await apiPatch(`/api/users/${id}`, data);
            await fetchUser(id);
            return await req.json();
        } catch (error) {
            const errorData = JSON.parse(error.message);
            notifyError("Greška prilikom ažuriranja", errorData.error);
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
        user,
        deleteUser,
        updateUser
    };
}
