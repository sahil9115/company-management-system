import {
  Calendar,
  Check,
  Copy,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"
import { useState } from "react"

import type { UserPublic } from "@/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import DeleteUser from "./DeleteUser"
import EditUser from "./EditUser"

interface UserCardProps {
  user: UserPublic
  isCurrentUser: boolean
  isNewlyCreated?: boolean
  isDeleting?: boolean
  onDeleteStart: (userId: string) => void
}

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return email ? email.slice(0, 2).toUpperCase() : "US"
}

export function UserCard({
  user,
  isCurrentUser,
  isNewlyCreated = false,
  isDeleting = false,
  onDeleteStart,
}: UserCardProps) {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently"

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col justify-between ${
        isDeleting ? "animate-card-exit" : ""
      } ${isNewlyCreated ? "animate-card-enter animate-highlight-glow ring-2 ring-primary/70" : ""}`}
    >
      {/* Top Accent Gradient Line */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          user.is_superuser
            ? "bg-gradient-to-r from-primary via-emerald-400 to-teal-500"
            : user.is_active
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
              : "bg-muted-foreground/30"
        }`}
      />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 border-2 border-background shadow-xs">
                <AvatarFallback
                  className={`font-semibold text-sm ${
                    user.is_superuser
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              {/* Online / Active status pulse indicator */}
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                  user.is_active ? "bg-emerald-500" : "bg-muted-foreground/60"
                }`}
                title={user.is_active ? "Active" : "Inactive"}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-semibold text-base truncate leading-tight tracking-tight"
                  title={user.full_name || user.email}
                >
                  {user.full_name || "User"}
                </h3>
                {isCurrentUser && (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/5 text-primary text-[10px] px-1.5 py-0 h-4 font-semibold"
                  >
                    You
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 flex flex-col gap-3">
        {/* Badges row: Role & Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {user.is_superuser ? (
            <Badge
              variant="default"
              className="bg-primary/15 text-primary hover:bg-primary/20 border border-primary/20 text-xs gap-1 font-medium shadow-none"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs gap-1 font-medium bg-muted text-muted-foreground"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Member
            </Badge>
          )}

          {user.is_active ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Inactive
            </span>
          )}
        </div>

        {/* Metadata info */}
        <div className="rounded-lg bg-muted/40 border p-2.5 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={copyEmail}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{copied ? "Copied!" : "Copy email"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Created
            </span>
            <span className="font-mono text-[11px]">{joinDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 border-t bg-muted/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full justify-end">
          <EditUser user={user} trigger="button" />
          {!isCurrentUser && (
            <DeleteUser
              id={user.id}
              trigger="button"
              onDeleteStart={() => onDeleteStart(user.id)}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default UserCard
