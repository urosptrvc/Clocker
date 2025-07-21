export function translateDayToSerbian(englishDay: string): string {
    const daysMap: Record<string, string> = {
        Monday: "Ponedeljak",
        Tuesday: "Utorak",
        Wednesday: "Sreda",
        Thursday: "Četvrtak",
        Friday: "Petak",
        Saturday: "Subota",
        Sunday: "Nedelja",
    }

    return daysMap[englishDay] || englishDay
}