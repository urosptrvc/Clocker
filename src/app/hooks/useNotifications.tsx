"use client"

import { useToast } from "@/components/ui/use-toast"


export function useNotifier() {
    const { toast } = useToast()

    function notifyError(title: string, description?: string) {
        toast({
            variant: "destructive",
            title,
            description,
        })
    }

    function notifySuccess(title: string, description?: string) {
        toast({
            variant: "success",
            title,
            description,
        })
    }

    return {
        notifyError,
        notifySuccess,
    }
}
