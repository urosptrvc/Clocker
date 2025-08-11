"use client"

import {useCallback} from "react"
import Cookies from "js-cookie";

type RequestOptions = {
    headers?: Record<string, string>
    body?: any
    params?: Record<string, string | number | boolean>
}

export function useApi(baseUrl: string = "") {
    const buildUrl = (url: string, params?: Record<string, string | number | boolean>) => {
        const query = params
            ? "?" +
            Object.entries(params)
                .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
                .join("&")
            : ""
        return `${baseUrl}${url}${query}`
    }

    const apiAuthToken = `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`

    const ProvideAuthToken = () => {
        const authorizedSession = Cookies.get(apiAuthToken)
        if(!authorizedSession) {
            return null
        }
        return authorizedSession
    }

    const apiGet = useCallback(async (url: string, options?: RequestOptions) => {
        const token = ProvideAuthToken()
        const res = await fetch(buildUrl(url, options?.params), {
            method: "GET",
            headers: {
                [apiAuthToken]: token,
                ...(options?.headers || {}),
            },
        })

        return res
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const apiPost = useCallback(
        async (url: string, body?: any, options?: RequestOptions) => {
            const token = ProvideAuthToken()
            const isFormData = typeof body !== "undefined" && body instanceof FormData;

            const res = await fetch(buildUrl(url, options?.params), {
                method: "POST",
                headers: isFormData
                    ? {
                        [apiAuthToken]: token,
                        ...(options?.headers || {}),
                    }
                    : {
                        "Content-Type": "application/json",
                        [apiAuthToken]: token,
                        ...(options?.headers || {}),
                    },
                body: isFormData ? body : JSON.stringify(body),
            });

            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const apiPut = useCallback(async (url: string, body?: any, options?: RequestOptions) => {
        const token = ProvideAuthToken()
        const res = await fetch(buildUrl(url, options?.params), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                [apiAuthToken]: token,
                ...(options?.headers || {}),
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(await res.text())
        return res.json()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const apiPatch = useCallback(async (url: string, body?: any, options?: RequestOptions) => {
        const token = ProvideAuthToken()
        const res = await fetch(buildUrl(url, options?.params), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                [apiAuthToken]: token,
                ...(options?.headers || {}),
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(await res.text())
        return res.json()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const apiDelete = useCallback(async (url: string, options?: RequestOptions) => {
        const token = ProvideAuthToken()
        const res = await fetch(buildUrl(url, options?.params), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                [apiAuthToken]: token,
                ...(options?.headers || {}),
            },
        })

        if (!res.ok) throw new Error(await res.text())
        return res.json()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        apiGet,
        apiPost,
        apiPut,
        apiDelete,
        apiPatch
    }
}