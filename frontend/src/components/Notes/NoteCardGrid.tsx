import { FileText, Pin, Search, StickyNote, Tag, X } from "lucide-react"
import { useMemo, useState } from "react"

import type { NotePublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AddNote from "./AddNote"
import NoteCard from "./NoteCard"

interface NoteCardGridProps {
  notes: NotePublic[]
  recentlyCreatedId: string | null
  onNoteCreated?: (noteId: string) => void
}

export function NoteCardGrid({
  notes,
  recentlyCreatedId,
  onNoteCreated,
}: NoteCardGridProps) {
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [pinFilter, setPinFilter] = useState<"all" | "pinned" | "unpinned">(
    "all",
  )
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Collect all unique tags across all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const note of notes) {
      if (note.tags) {
        for (const t of note.tags.split(",")) {
          const trimmed = t.trim()
          if (trimmed) tagSet.add(trimmed)
        }
      }
    }
    return Array.from(tagSet)
  }, [notes])

  // Filter notes client-side for immediate responsive UX
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search filter
      const term = search.toLowerCase().trim()
      if (term) {
        const matchTitle = note.title?.toLowerCase().includes(term)
        const matchContent = note.content?.toLowerCase().includes(term)
        const matchTags = note.tags?.toLowerCase().includes(term)
        if (!matchTitle && !matchContent && !matchTags) return false
      }

      // Tag filter
      if (selectedTag) {
        if (!note.tags) return false
        const tags = note.tags.split(",").map((t) => t.trim().toLowerCase())
        if (!tags.includes(selectedTag.toLowerCase())) return false
      }

      // Pin filter
      if (pinFilter === "pinned" && !note.is_pinned) return false
      if (pinFilter === "unpinned" && note.is_pinned) return false

      return true
    })
  }, [notes, search, selectedTag, pinFilter])

  const handleDeleteStart = (noteId: string) => {
    setDeletingIds((prev) => new Set(prev).add(noteId))
  }

  const hasFilters =
    search !== "" || selectedTag !== null || pinFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setSelectedTag(null)
    setPinFilter("all")
  }

  // Quick stats
  const totalNotes = notes.length
  const pinnedCount = notes.filter((n) => n.is_pinned).length
  const tagsCount = allTags.length

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-primary/30">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <StickyNote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Total Notes
            </p>
            <p className="text-xl font-bold tracking-tight">{totalNotes}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-amber-500/30">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Pin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Pinned Notes
            </p>
            <p className="text-xl font-bold tracking-tight">{pinnedCount}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-teal-500/30">
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Unique Tags
            </p>
            <p className="text-xl font-bold tracking-tight">{tagsCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/40 backdrop-blur-xs shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, content, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background/80"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Pin Filter Buttons */}
          <div className="inline-flex rounded-lg border p-0.5 bg-muted/40 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setPinFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                pinFilter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setPinFilter("pinned")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                pinFilter === "pinned"
                  ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pin className="h-3 w-3 fill-current" />
              Pinned
            </button>
            <button
              type="button"
              onClick={() => setPinFilter("unpinned")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                pinFilter === "unpinned"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Regular
            </button>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Add Note Button */}
        <div className="shrink-0 flex items-center justify-end">
          <AddNote onNoteCreated={onNoteCreated} />
        </div>
      </div>

      {/* Active Tags Filter Bar (if tags exist) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <Tag className="h-3 w-3" />
            Tags:
          </span>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "secondary"}
                className={`text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
              >
                #{tag}
                {isSelected && <X className="h-3 w-3 ml-1" />}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed bg-card/30 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-base mb-1">
            {hasFilters ? "No matching notes found" : "No notes yet"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {hasFilters
              ? "Try adjusting your search query, clearing tag filters, or resetting pin view."
              : "Create your first personal or team note to keep track of thoughts, ideas, and meeting summaries."}
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            <AddNote onNoteCreated={onNoteCreated} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isNewlyCreated={recentlyCreatedId === note.id}
              isDeleting={deletingIds.has(note.id)}
              onDeleteStart={handleDeleteStart}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NoteCardGrid
