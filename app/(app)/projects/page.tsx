"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/components/app-context"
import { PageContainer, PageHeading, WorkspaceTabs } from "@/components/page-parts"
import { NewCard, cardGrid } from "@/components/document-card"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectModal } from "@/components/create-project-modal"
import { PROJECTS, type Project } from "@/lib/data"
import { Search } from "lucide-react"

export default function ProjectsPage() {
  const { toast, addRecent } = useApp()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [projects, query],
  )

  const create = (name: string) => {
    const id = `p-new-${Date.now()}`
    const project: Project = { id, name, private: true, status: "Preparing" }
    setProjects((p) => [project, ...p])
    setModalOpen(false)
    toast(`Created project: ${name}`)
    addRecent({ id, title: name, href: `/projects/${id}` })
    router.push(`/projects/${id}?created=1`)
  }

  return (
    <PageContainer>
      <WorkspaceTabs base="/projects" />
      <div className="pt-6">
        <PageHeading
          title="Projects"
          subtitle="Your one-stop destination for streamlined bid writing projects."
          action={
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your projects"
                className="h-9 w-full min-w-[240px] rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          }
        />
        <div className={`${cardGrid} mt-6`}>
          <NewCard label="Project" onClick={() => setModalOpen(true)} />
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={create}
      />
    </PageContainer>
  )
}
