import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useState } from "react"

import { NotesService } from "@/client"
import { NoteCardGrid } from "@/components/Notes/NoteCardGrid"
import { Skeleton } from "@/components/ui/skeleton"
import { APP_NAME } from "@/config"

function getNotesQueryOptions() {
  return {
    queryFn: async () =>
      (await NotesService.readNotes({ query: { skip: 0, limit: 200 } })).data,
    queryKey: ["notes"],
  }
}

export const Route = createFileRoute("/_layout/notes")({
  component: Notes,
  head: () => ({
    meta: [
      {
        title: `Notes - ${APP_NAME}`,
      },
    ],
  }),
})

function PendingNotesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`pending-note-${index}`}
          className="rounded-xl border bg-card p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-16 w-full rounded-md" />
          <div className="flex gap-2 pt-2 border-t">
            <Skeleton className="h-4 w-12 rounded-sm" />
            <Skeleton className="h-4 w-12 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NotesContent() {
  const { data: notesData } = useSuspenseQuery(getNotesQueryOptions())
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(
    null,
  )

  const handleNoteCreated = (noteId: string) => {
    setRecentlyCreatedId(noteId)
    setTimeout(() => {
      setRecentlyCreatedId(null)
    }, 4000)
  }

  return (
    <NoteCardGrid
      notes={notesData.data}
      recentlyCreatedId={recentlyCreatedId}
      onNoteCreated={handleNoteCreated}
    />
  )
}

function Notes() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground text-sm">
            Organize personal ideas, team meeting notes, and pinned
            announcements.
          </p>
        </div>
      </div>

      <Suspense fallback={<PendingNotesGrid />}>
        <NotesContent />
      </Suspense>
    </div>
  )
}

export default Notes
