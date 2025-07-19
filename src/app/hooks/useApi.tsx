"use client"

import {useCallback} from "react"

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

    const apiGet = useCallback(async (url: string, options?: RequestOptions) => {
        const res = await fetch(buildUrl(url, options?.params), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(options?.headers || {}),
            },
        })

        if (!res.ok) throw new Error(await res.text())
        return res.json()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const apiPost = useCallback(
        async (url: string, body?: any, options?: RequestOptions) => {
            const isFormData = typeof body !== "undefined" && body instanceof FormData;

            const res = await fetch(buildUrl(url, options?.params), {
                method: "POST",
                headers: isFormData
                    ? {
                        ...(options?.headers || {}),
                    }
                    : {
                        "Content-Type": "application/json",
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
        const res = await fetch(buildUrl(url, options?.params), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(options?.headers || {}),
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(await res.text())
        return res.json()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const apiDelete = useCallback(async (url: string, options?: RequestOptions) => {
        const res = await fetch(buildUrl(url, options?.params), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
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
    }
}
