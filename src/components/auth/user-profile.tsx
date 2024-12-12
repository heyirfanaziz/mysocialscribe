'use client'

import Link from 'next/link'
import { User } from '@supabase/auth-js'
import { GoHistory } from 'react-icons/go'
import { ChevronDown, LogOut } from 'lucide-react'

import { logout } from '@/actions/handle_auth_action'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserProfile({ user }: { user: User | undefined }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-0 !bg-transparent p-0 focus-visible:ring-0 dark:focus-visible:ring-0"
        >
          <Avatar className="flex h-8 w-8 items-center justify-center">
            <AvatarImage
              src={user?.user_metadata?.avatar_url || '/avatar.png'}
              alt={user?.user_metadata?.full_name}
              className="w-full rounded-full object-cover object-center"
            />
            <AvatarFallback>{user?.user_metadata?.full_name?.[0]}</AvatarFallback>
          </Avatar>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="ms-2 opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {user?.user_metadata?.full_name}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link
            href="/history"
            prefetch
          >
            <DropdownMenuItem>
              <GoHistory
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>History</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await logout()}>
          <LogOut
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
