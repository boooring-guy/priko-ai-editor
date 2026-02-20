import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";

export const requireAuth = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
};
