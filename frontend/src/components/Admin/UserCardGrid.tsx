import { Search, ShieldAlert, UserCheck, Users, X } from "lucide-react"
import { useMemo, useState } from "react"

import type { UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UserCard from "./UserCard"

interface UserCardGridProps {
  users: UserPublic[]
  currentUser?: UserPublic | null
  recentlyCreatedId: string | null
}

export function UserCardGrid({
  users,
  currentUser,
  recentlyCreatedId,
}: UserCardGridProps) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "superuser" | "regular">(
    "all",
  )
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const term = search.toLowerCase().trim()
      if (term) {
        const matchesName = user.full_name?.toLowerCase().includes(term)
        const matchesEmail = user.email.toLowerCase().includes(term)
        if (!matchesName && !matchesEmail) return false
      }

      // Role filter
      if (roleFilter === "superuser" && !user.is_superuser) return false
      if (roleFilter === "regular" && user.is_superuser) return false

      // Status filter
      if (statusFilter === "active" && !user.is_active) return false
      if (statusFilter === "inactive" && user.is_active) return false

      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const handleDeleteStart = (userId: string) => {
    setDeletingIds((prev) => new Set(prev).add(userId))
  }

  const hasFilters =
    search !== "" || roleFilter !== "all" || statusFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setRoleFilter("all")
    setStatusFilter("all")
  }

  // Quick stats
  const totalCount = users.length
  const adminCount = users.filter((u) => u.is_superuser).length
  const activeCount = users.filter((u) => u.is_active).length

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-primary/30">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Total Users
            </p>
            <p className="text-xl font-bold tracking-tight">{totalCount}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-emerald-500/30">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Active Accounts
            </p>
            <p className="text-xl font-bold tracking-tight">{activeCount}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-primary/30">
          <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Superusers
            </p>
            <p className="text-xl font-bold tracking-tight">{adminCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/40 backdrop-blur-xs shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-background/80"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter Tabs */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                roleFilter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("superuser")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                roleFilter === "superuser"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admins
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("regular")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                roleFilter === "regular"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === "active"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === "inactive"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inactive
            </button>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/20 border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-base mb-1">No users found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {hasFilters
              ? "Try adjusting your search criteria or filters to find what you're looking for."
              : "No user accounts have been added yet."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={currentUser?.id === user.id}
              isNewlyCreated={recentlyCreatedId === user.id}
              isDeleting={deletingIds.has(user.id)}
              onDeleteStart={handleDeleteStart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UserCardGrid
