"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "../api/use-current-user";
import { useLogout } from "../api/use-logout";

export const UserButton = () => {
  const { data: session, isPending } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col text-sm items-end">
        <span className="font-medium text-foreground">{session.user.name}</span>
        <span className="text-muted-foreground">{session.user.email}</span>
      </div>
      <Separator orientation="vertical" className="h-8" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => logout()}
        disabled={isLoggingOut}
      >
        {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Logout
      </Button>
    </div>
  );
};
