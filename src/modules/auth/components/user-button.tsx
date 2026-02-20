"use client";

import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "../api/use-current-user";
import { useLogout } from "../api/use-logout";
import Image from "next/image";
import { useState } from "react";

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

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col text-sm items-end">
        <span className="font-medium text-foreground">
          {session.user.name ?? "User"}
        </span>
        <span className="text-muted-foreground">{session.user.email}</span>
      </div>

      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border">
        {showImage ? (
          <Image
            src={userImage}
            alt={session.user.name ?? "User Avatar"}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
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
