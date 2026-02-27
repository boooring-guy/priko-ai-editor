"use client";

import { Loader2, LogOut, Settings, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { useLogout } from "../api/use-logout";

export const UserButton = () => {
  const { data: session, isPending } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [imageError, setImageError] = useState(false);

  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!session) {
    return null;
  }

  const userImage = session.user.image;
  const showImage = userImage && !imageError;
  const username = session.user.name ?? "User";
  const userEmail = session.user.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border hover:ring-2 hover:ring-offset-2 hover:ring-ring transition-all outline-none">
          {showImage ? (
            <Image
              src={userImage}
              alt={username}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => logout()}
          disabled={isLoggingOut}
          variant="destructive"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
