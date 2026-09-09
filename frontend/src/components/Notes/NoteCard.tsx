import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Clock, Copy, MoreVertical, Pin } from "lucide-react"
import { useState } from "react"

import { type NotePublic, NotesService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import DeleteNote from "./DeleteNote"
import EditNote from "./EditNote"

interface NoteCardProps {
  note: NotePublic
  isNewlyCreated?: boolean
  isDeleting?: boolean
  onDeleteStart: (noteId: string) => void
  onTagClick?: (tag: string) => void
}

export function NoteCard({
  note,
  isNewlyCreated = false,
  isDeleting = false,
  onDeleteStart,
  onTagClick,
}: NoteCardProps) {
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const copyContent = () => {
    const textToCopy = `${note.title}\n\n${note.content}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pinMutation = useMutation({
    mutationFn: () => NotesService.togglePinNote({ path: { id: note.id } }),
    onSuccess: (updated) => {
      showSuccessToast(
        updated.data.is_pinned ? "Note pinned to top" : "Note unpinned",
      )
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  // Parse comma-separated tags
  const tagsList = note.tags
    ? note.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const formattedDate = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : note.created_at
      ? new Date(note.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : ""

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col justify-between ${
        isDeleting ? "animate-card-exit" : ""
      } ${
        isNewlyCreated
          ? "animate-card-enter animate-highlight-glow ring-2 ring-primary/70"
          : ""
      } ${
        note.is_pinned
          ? "bg-card border-amber-500/30 dark:border-amber-500/20 shadow-xs"
          : "bg-card"
      }`}
    >
      {/* Top Accent Gradient Line */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          note.is_pinned
            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
            : "bg-gradient-to-r from-primary/80 to-teal-500/70 opacity-60 group-hover:opacity-100"
        }`}
      />

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {note.is_pinned && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider py-0 px-1.5 gap-1"
                >
                  <Pin className="h-2.5 w-2.5 fill-current" />
                  Pinned
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {note.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0 -mr-1">
            {/* Quick Pin Toggle Button */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-md transition-colors ${
                      note.is_pinned
                        ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        : "text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={() => pinMutation.mutate()}
                    disabled={pinMutation.isPending}
                    aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
                  >
                    {note.is_pinned ? (
                      <Pin className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {note.is_pinned ? "Unpin note" : "Pin note"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <EditNote note={note} trigger="dropdown" />
                <DeleteNote
                  id={note.id}
                  title={note.title}
                  trigger="dropdown"
                  onDeleteStart={onDeleteStart}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-1">
        {/* Content Body */}
        {note.content ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words line-clamp-4 leading-relaxed font-normal">
            {note.content}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">
            No content provided
          </p>
        )}

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/50">
            {tagsList.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[11px] font-medium px-2 py-0.5 rounded-md hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy content button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={copyContent}
                  aria-label="Copy note content"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{copied ? "Copied!" : "Copy note"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Quick Edit */}
          <EditNote note={note} trigger="icon" />

          {/* Quick Delete */}
          <DeleteNote
            id={note.id}
            title={note.title}
            trigger="icon"
            onDeleteStart={onDeleteStart}
          />
        </div>
      </CardFooter>
    </Card>
  )
}

export default NoteCard
