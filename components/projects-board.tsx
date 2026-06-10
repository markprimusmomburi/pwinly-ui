"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "./app-context"
import { useClickOutside } from "./ui-kit"
import { cn } from "@/lib/utils"
import {
  KANBAN_COLUMNS,
  type KanbanProject,
  type KanbanColumnId,
} from "@/lib/data"
import {
  Circle,
  CircleDot,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Settings2,
  Trash2,
  Plus,
} from "lucide-react"

/* ---------- Column header icon ---------- */
function ColumnIcon({ id, color }: { id: KanbanColumnId; color: string }) {
  if (id === "Submitted")
    return <CheckCircle2 className="h-4 w-4" style={{ color }} fill={color} stroke="#ffffff" />
  if (id === "Won")
    return <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
  if (id === "Formal Review") return <CircleDot className="h-4 w-4" style={{ color }} />
  if (id === "Writing") return <CircleDot className="h-4 w-4" style={{ color }} />
  return <Circle className="h-4 w-4" style={{ color }} strokeWidth={2} />
}

/* ---------- Avatar stack ---------- */
function AvatarStack({
  people,
  overflow,
}: {
  people: string[]
  overflow?: number
}) {
  return (
    <span className="flex items-center -space-x-1.5">
      {people.map((p, i) => (
        <span
          key={`${p}-${i}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[9px] font-semibold text-primary-foreground"
        >
          {p}
        </span>
      ))}
      {overflow ? (
        <span className="inline-flex h-6 items-center justify-center rounded-full border-2 border-card bg-muted px-1.5 text-[9px] font-semibold text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </span>
  )
}

/* ---------- Project card ---------- */
function BoardCard({ project }: { project: KanbanProject }) {
  const router = useRouter()
  const { toast, addRecent } = useApp()
  const [menu, setMenu] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setMenu(false), menu)

  const open = () => {
    addRecent({ id: project.id, title: project.name, href: `/projects/${project.id}` })
    router.push(`/projects/${project.id}`)
  }

  const ownerLabel = project.owners.length > 1 ? "Owners" : "Owner"

  return (
    <div
      onClick={open}
      className="group cursor-pointer rounded-lg border border-border bg-card transition-fast hover:border-primary/40 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
    >
      <div className="p-3.5">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
          {project.name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">{ownerLabel}</span>
          <AvatarStack people={project.owners} overflow={project.ownerOverflow} />
        </div>
        {project.reviewers && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Reviewers</span>
            <AvatarStack people={project.reviewers} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-1 border-t border-border px-3 py-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          Open
        </span>
        <div className="relative" ref={ref}>
          <button
            aria-label="Card options"
            onClick={(e) => {
              e.stopPropagation()
              setMenu((m) => !m)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-fast hover:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg animate-slide-down"
            >
              {[
                { label: "Rename", icon: Pencil },
                { label: "Manage", icon: Settings2 },
              ].map((it) => (
                <button
                  key={it.label}
                  onClick={() => {
                    setMenu(false)
                    toast(`${it.label}: ${project.name}`)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-fast hover:bg-muted"
                >
                  <it.icon className="h-4 w-4 text-muted-foreground" />
                  {it.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMenu(false)
                  toast(`Deleted ${project.name}`, "error")
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-destructive transition-fast hover:bg-destructive-bg"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Column header menu ---------- */
function ColumnMenu({ name }: { name: string }) {
  const { toast } = useApp()
  const [menu, setMenu] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setMenu(false), menu)
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Column options"
        onClick={() => setMenu((m) => !m)}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-fast hover:bg-border/60"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu && (
        <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg animate-slide-down">
          {["Rename column", "Set limit", "Hide column"].map((label) => (
            <button
              key={label}
              onClick={() => {
                setMenu(false)
                toast(`${label}: ${name}`)
              }}
              className="flex w-full items-center px-3 py-2 text-[13px] transition-fast hover:bg-muted"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectsBoard({
  projects,
  onNew,
}: {
  projects: KanbanProject[]
  onNew: () => void
}) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-4 scrollbar-thin">
      <div className="flex min-w-max gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const items = projects.filter((p) => p.column === col.id)
          return (
            <div
              key={col.id}
              className="flex w-[264px] shrink-0 flex-col rounded-xl bg-secondary"
            >
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <ColumnIcon id={col.id} color={col.color} />
                  <span className="text-[13px] font-semibold text-foreground">
                    {col.id}
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <ColumnMenu name={col.id} />
              </div>
              <div className="flex flex-col gap-2.5 px-2.5 pb-2.5">
                {items.map((p) => (
                  <BoardCard key={p.id} project={p} />
                ))}
                <button
                  onClick={onNew}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-[12px] font-medium text-muted-foreground transition-fast hover:border-primary/40 hover:text-primary",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add project
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
