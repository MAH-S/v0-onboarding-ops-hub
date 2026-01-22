"use client"

import { Bell, Search, Moon, Sun, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth-store"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { projects, associates } = useAppStore()
  const router = useRouter()
  const { user, logout, hasPermission, canAccessProject } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const accessibleProjects = projects.filter((project) => canAccessProject(project.ownerId, project.assignedAssociates))

  const accessibleAssociates = hasPermission("associates") ? associates : []

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="relative h-9 w-64 justify-start text-sm text-muted-foreground bg-transparent"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search projects, associates...
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">New quote uploaded</span>
                <span className="text-xs text-muted-foreground">Sarah Chen uploaded vendor_quote_acme.pdf</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">Milestone overdue</span>
                <span className="text-xs text-muted-foreground">Data Migration Phase is past due date</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">Task completed</span>
                <span className="text-xs text-muted-foreground">Setup development environment marked as done</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="w-fit mt-1 text-xs">
                    {user?.role ? ROLE_LABELS[user.role] : "Unknown Role"}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              {hasPermission("settings") && <DropdownMenuItem>Settings</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search projects, associates..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {accessibleProjects.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => {
                  router.push(`/projects/${project.id}`)
                  setOpen(false)
                }}
              >
                <span>{project.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{project.client}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          {accessibleAssociates.length > 0 && (
            <CommandGroup heading="Associates">
              {accessibleAssociates.map((associate) => (
                <CommandItem
                  key={associate.id}
                  onSelect={() => {
                    router.push(`/associates/${associate.id}`)
                    setOpen(false)
                  }}
                >
                  <span>{associate.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{associate.role}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
