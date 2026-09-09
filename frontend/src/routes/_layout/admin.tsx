import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { Suspense, useState } from "react"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import UserCardGrid from "@/components/Admin/UserCardGrid"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { APP_NAME } from "@/config"
import useAuth from "@/hooks/useAuth"

function getUsersQueryOptions() {
  return {
    queryFn: async () =>
      (await UsersService.readUsers({ query: { skip: 0, limit: 100 } })).data,
    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  beforeLoad: async () => {
    const { data: user } = await UsersService.readUserMe()

    if (!user) {
      throw redirect({
        to: "/login",
      })
    }

    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: `User Management - ${APP_NAME}`,
      },
    ],
  }),
})

function PendingCardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-5 flex flex-col gap-4 bg-card/50"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface UsersContentProps {
  viewMode: "cards" | "table"
  recentlyCreatedId: string | null
}

function UsersContent({ viewMode, recentlyCreatedId }: UsersContentProps) {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  if (viewMode === "cards") {
    return (
      <UserCardGrid
        users={users.data}
        currentUser={currentUser}
        recentlyCreatedId={recentlyCreatedId}
      />
    )
  }

  const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

function Admin() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(
    null,
  )

  const handleUserCreated = (newId: string) => {
    setRecentlyCreatedId(newId)
    setViewMode("cards") // Switch to card view to highlight newly created card
    setTimeout(() => {
      setRecentlyCreatedId(null)
    }, 4000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auth Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage authenticated user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Switcher */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 gap-1.5 text-xs font-medium"
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 gap-1.5 text-xs font-medium"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </Button>
          </div>

          <AddUser onUserCreated={handleUserCreated} />
        </div>
      </div>

      <Suspense
        fallback={viewMode === "cards" ? <PendingCardGrid /> : <PendingUsers />}
      >
        <UsersContent
          viewMode={viewMode}
          recentlyCreatedId={recentlyCreatedId}
        />
      </Suspense>
    </div>
  )
}
