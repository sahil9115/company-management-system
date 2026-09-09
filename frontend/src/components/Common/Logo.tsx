import { Link } from "@tanstack/react-router"

import { useTheme } from "@/components/theme-provider"
import { APP_NAME } from "@/config"
import { cn } from "@/lib/utils"
import icon from "/assets/images/fastapi-icon.svg"
import iconLight from "/assets/images/fastapi-icon-light.svg"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const iconLogo = isDark ? iconLight : icon

  const content =
    variant === "responsive" ? (
      <div className="flex items-center gap-2.5 overflow-hidden">
        <img
          src={iconLogo}
          alt={APP_NAME}
          className={cn("size-6 shrink-0", className)}
        />
        <span className="font-semibold text-sm tracking-tight truncate group-data-[collapsible=icon]:hidden">
          {APP_NAME}
        </span>
      </div>
    ) : variant === "icon" ? (
      <img
        src={iconLogo}
        alt={APP_NAME}
        className={cn("size-6 shrink-0", className)}
      />
    ) : (
      <div className="flex items-center gap-3">
        <img
          src={iconLogo}
          alt={APP_NAME}
          className={cn("size-8 shrink-0", className)}
        />
        <span className="font-bold text-xl tracking-tight text-foreground">
          {APP_NAME}
        </span>
      </div>
    )

  if (!asLink) {
    return content
  }

  return (
    <Link to="/" className="inline-flex items-center">
      {content}
    </Link>
  )
}
