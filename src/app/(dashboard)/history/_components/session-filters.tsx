"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, CalendarDays } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getMonthOptions } from "@/lib/helper";

export function SessionFilters({
                                 filterBy,
                                 setFilterBy,
                                 selectedMonth,
                                 setSelectedMonth,
                                 sortBy,
                                 setSortBy,
                                 sortOrder,
                                 setSortOrder,
                               }: any) {
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
      <div className="flex flex-wrap gap-2">
        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-40 ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ukupno</SelectItem>
            <SelectItem value="today">Danas</SelectItem>
            <SelectItem value="week">Ove nedelje</SelectItem>
            <SelectItem value="month">Poslednjih 30 dana</SelectItem>
            <SelectItem value="custom-month">Odabir meseca</SelectItem>
          </SelectContent>
        </Select>

        {filterBy === "custom-month" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-start bg-transparent ">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {getMonthOptions().find((opt) => opt.value === selectedMonth)?.label || "Odaberi mesec"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="max-h-64 overflow-y-auto">
                  {getMonthOptions().map((option) => (
                      <Button
                          key={option.value}
                          variant={selectedMonth === option.value ? "default" : "ghost"}
                          className="w-full justify-start rounded-none "
                          onClick={() => setSelectedMonth(option.value)}
                      >
                        {option.label}
                      </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
        )}

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-44 ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sortiraj po datumu</SelectItem>
            <SelectItem value="duration">Sortiraj po trajanju</SelectItem>
          </SelectContent>
        </Select>

        <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-1 bg-transparent "
        >
          {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {sortOrder === "asc" ? "Rastuce" : "Opadajuce"}
        </Button>
      </div>
  )
}
