"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    selected?: DateRange
    onSelect?: (range: DateRange | undefined) => void
}

export function DatePickerWithRange({ className, selected, onSelect }: DatePickerWithRangeProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const presets = [
        {
            label: "Today",
            range: {
                from: new Date(),
                to: new Date(),
            },
        },
        {
            label: "Yesterday",
            range: {
                from: addDays(new Date(), -1),
                to: addDays(new Date(), -1),
            },
        },
        {
            label: "Last 7 days",
            range: {
                from: addDays(new Date(), -6),
                to: new Date(),
            },
        },
        {
            label: "Last 30 days",
            range: {
                from: addDays(new Date(), -29),
                to: new Date(),
            },
        },
        {
            label: "This month",
            range: {
                from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                to: new Date(),
            },
        },
        {
            label: "Last month",
            range: {
                from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
            },
        },
    ]

    const handlePresetClick = (preset: { label: string; range: DateRange }) => {
        onSelect?.(preset.range)
        setIsOpen(false)
    }

    const handleCalendarSelect = (range: DateRange | undefined) => {
        onSelect?.(range)
        // Only close when both from and to dates are selected
        if (range?.from && range?.to) {
            setIsOpen(false)
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn("w-[300px] justify-start text-left font-normal", !selected && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected?.from ? (
                            selected.to ? (
                                <>
                                    {format(selected.from, "LLL dd, y")} - {format(selected.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(selected.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <div className="border-r">
                            <div className="p-3">
                                <div className="text-sm font-medium mb-2">Quick select</div>
                                <div className="grid gap-1">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.label}
                                            variant="ghost"
                                            className="justify-start text-sm font-normal h-9"
                                            onClick={() => handlePresetClick(preset)}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={selected?.from}
                                selected={selected}
                                onSelect={handleCalendarSelect}
                                numberOfMonths={2}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
