"use client"

import * as React from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
    useDroppable,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    FileText,
    CheckCircle2,
    ExternalLink,
    Download,
    GripVertical,
    CalendarDays,
    User,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
type MilestoneStatus = "pending" | "submitted" | "reviewed"

interface MilestoneItem {
    _id: string
    title: string
    description: string
    dueDate: string
    status: MilestoneStatus
    fileUrl: string | null
    fileName: string | null
    submittedAt: string | null
    createdAt: string
}

interface KanbanMilestone extends MilestoneItem {
    proposalId: string
    studentName: string
}

interface MilestoneKanbanProps {
    milestones: KanbanMilestone[]
    onStatusChange: (
        proposalId: string,
        milestoneId: string,
        newStatus: MilestoneStatus
    ) => void
}

// ─── Column config ──────────────────────────────────────────────────
const COLUMNS: {
    id: MilestoneStatus
    label: string
    icon: React.ReactNode
    bg: string
    border: string
    headerBg: string
    badgeClass: string
    dot: string
}[] = [
    {
        id: "pending",
        label: "Pending",
        icon: <Clock className="w-4 h-4" />,
        bg: "bg-amber-50/60",
        border: "border-amber-200/60",
        headerBg: "bg-amber-100/80",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-400",
    },
    {
        id: "submitted",
        label: "Submitted",
        icon: <FileText className="w-4 h-4" />,
        bg: "bg-blue-50/60",
        border: "border-blue-200/60",
        headerBg: "bg-blue-100/80",
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
    },
    {
        id: "reviewed",
        label: "Reviewed",
        icon: <CheckCircle2 className="w-4 h-4" />,
        bg: "bg-emerald-50/60",
        border: "border-emerald-200/60",
        headerBg: "bg-emerald-100/80",
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-400",
    },
]

// ─── Droppable Column ───────────────────────────────────────────────
function KanbanColumn({
    column,
    items,
    children,
}: {
    column: (typeof COLUMNS)[number]
    items: KanbanMilestone[]
    children: React.ReactNode
}) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id })

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border ${column.border} ${column.bg} transition-all min-h-[320px] ${
                isOver ? "ring-2 ring-offset-2 ring-blue-400/50 scale-[1.01]" : ""
            }`}
        >
            {/* Column header */}
            <div
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${column.headerBg}`}
            >
                <div className={`w-2 h-2 rounded-full ${column.dot}`} />
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    {column.icon}
                    {column.label}
                </span>
                <Badge
                    variant="outline"
                    className={`ml-auto text-xs tabular-nums ${column.badgeClass}`}
                >
                    {items.length}
                </Badge>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[60vh]">
                <SortableContext
                    items={items.map((m) => m._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>

                {items.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                        Drop milestones here
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Sortable Card ──────────────────────────────────────────────────
function SortableCard({ milestone }: { milestone: KanbanMilestone }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: milestone._id })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <MilestoneCard milestone={milestone} dragListeners={listeners} />
        </div>
    )
}

// ─── Card (shared between sortable + overlay) ──────────────────────
function MilestoneCard({
    milestone,
    dragListeners,
}: {
    milestone: KanbanMilestone
    dragListeners?: React.HTMLAttributes<HTMLElement>
}) {
    const overdue =
        milestone.status !== "reviewed" &&
        new Date(milestone.dueDate) < new Date()

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-3 cursor-default group">
            {/* Drag handle + title */}
            <div className="flex items-start gap-2">
                <button
                    className="mt-0.5 p-0.5 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors cursor-grab active:cursor-grabbing shrink-0"
                    {...dragListeners}
                    aria-label="Drag milestone"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
                        {milestone.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {milestone.description}
                    </p>
                </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{milestone.studentName}</span>
                </span>
                <span
                    className={`flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : ""}`}
                >
                    <CalendarDays className="w-3 h-3" />
                    {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}
                    {overdue && " (overdue)"}
                </span>
            </div>

            {/* File link (if submitted/reviewed) */}
            {milestone.fileUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                    <a
                        href={milestone.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View
                    </a>
                    <a
                        href={milestone.fileUrl}
                        download={milestone.fileName ?? "file"}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" />
                        Download
                    </a>
                </div>
            )}
        </div>
    )
}

// ─── Main Kanban Component ──────────────────────────────────────────
export function MilestoneKanban({
    milestones,
    onStatusChange,
}: MilestoneKanbanProps) {
    // Split milestones into columns
    const columns = React.useMemo(() => {
        const map: Record<MilestoneStatus, KanbanMilestone[]> = {
            pending: [],
            submitted: [],
            reviewed: [],
        }
        for (const m of milestones) {
            map[m.status]?.push(m)
        }
        // Sort each column by due date
        for (const key of Object.keys(map) as MilestoneStatus[]) {
            map[key].sort(
                (a, b) =>
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
        }
        return map
    }, [milestones])

    const [activeId, setActiveId] = React.useState<string | null>(null)

    const activeMilestone = React.useMemo(
        () => milestones.find((m) => m._id === activeId) ?? null,
        [milestones, activeId]
    )

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Find which column a milestone lives in
    function findColumn(id: string): MilestoneStatus | null {
        for (const [status, items] of Object.entries(columns)) {
            if (items.some((m) => m._id === id)) {
                return status as MilestoneStatus
            }
        }
        // id might be the column id itself
        if (id === "pending" || id === "submitted" || id === "reviewed") {
            return id
        }
        return null
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id))
    }

    function handleDragOver(_event: DragOverEvent) {
        // Visual feedback handled by useDroppable's isOver
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null)

        const { active, over } = event
        if (!over) return

        const activeIdStr = String(active.id)
        const overIdStr = String(over.id)

        const sourceCol = findColumn(activeIdStr)
        // over could be a column id or another card id
        let destCol = findColumn(overIdStr)

        // If we dropped over a card, get its column
        if (destCol && destCol !== "pending" && destCol !== "submitted" && destCol !== "reviewed") {
            // destCol is already the status of that card
        }
        // If dropped directly on a column droppable
        if (overIdStr === "pending" || overIdStr === "submitted" || overIdStr === "reviewed") {
            destCol = overIdStr as MilestoneStatus
        }

        if (!sourceCol || !destCol || sourceCol === destCol) return

        // Find the milestone
        const milestone = milestones.find((m) => m._id === activeIdStr)
        if (!milestone) return

        onStatusChange(milestone.proposalId, milestone._id, destCol)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        items={columns[col.id]}
                    >
                        {columns[col.id].map((m) => (
                            <SortableCard key={m._id} milestone={m} />
                        ))}
                    </KanbanColumn>
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeMilestone ? (
                    <div className="rotate-2 scale-105">
                        <MilestoneCard milestone={activeMilestone} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
