export const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString("sr-RS", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export const formatSalary = (seconds: number, hourlyRate: any) => {
    const hours = seconds / 3600
    const salary = hours * hourlyRate
    return salary.toFixed(2) + ' RSD'
}

export const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatted = dateObj.toLocaleString("sr-Latn-RS", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour12: false
    });
    return formatted.replace(/^\p{Ll}|\s\p{Ll}/gu, match => match.toUpperCase());
};

export const getMonthDateRange = (monthString: string): { startDate: Date; endDate: Date } => {
    const [year, month] = monthString.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return {startDate, endDate};
};


export function getSessionDuration(activeSession) {
    if (!activeSession?.clockInEvent?.timestamp) return 0;
    const startTime = new Date(activeSession.clockInEvent.timestamp) as any;
    const now = new Date() as any;
    return Math.floor((now - startTime) / 1000);
}

export const getMonthOptions = (): Array<{ value: string; label: string }> => {
    const options = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0") // meseci su 0-indeksirani

        const value = `${year}-${month}`

        let label = date.toLocaleDateString("sr-Latn-RS", {
            month: "long",
            year: "numeric",
        })
        label = label.charAt(0).toUpperCase() + label.slice(1)

        options.push({value, label})
    }
    return options
}
