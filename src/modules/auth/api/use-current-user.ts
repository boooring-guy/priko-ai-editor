import { authClient } from "@/lib/auth-client";

export const useCurrentUser = () => {
  return authClient.useSession();
};
