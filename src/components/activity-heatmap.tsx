"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ActivityHeatmapProps {
    activity: Record<string, number>
    days?: number
    title?: string
    className?: string
}

interface Cell {
    date: string
    count: number
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
}

function buildCells(activity: Record<string, number>, days: number): Cell[] {
    const cells: Cell[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const key = toDateKey(d)
        cells.push({ date: key, count: activity[key] ?? 0 })
    }
    return cells
}

function colorForCount(count: number): string {
    if (count <= 0) return "bg-slate-100"
    if (count === 1) return "bg-emerald-200"
    if (count === 2) return "bg-emerald-300"
    if (count === 3) return "bg-emerald-500"
    return "bg-emerald-700"
}

export function ActivityHeatmap({ activity, days = 84, title = "Consistency", className }: ActivityHeatmapProps) {
    const cells = React.useMemo(() => buildCells(activity, days), [activity, days])

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500">Last {days} days</p>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-max gap-1 min-w-max">
                    {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-1">
                            {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell) => (
                                <div
                                    key={cell.date}
                                    className={cn("h-3.5 w-3.5 rounded-[3px] border border-slate-200", colorForCount(cell.count))}
                                    title={`${cell.date}: ${cell.count} response${cell.count === 1 ? "" : "s"}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
                <span>Less</span>
                <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-100 border border-slate-200" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-200 border border-slate-200" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-300 border border-slate-200" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500 border border-slate-200" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-700 border border-slate-200" />
                <span>More</span>
            </div>
        </div>
    )
}
