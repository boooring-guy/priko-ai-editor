import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await signOut();

      if (error) {
        throw new Error(error.message || "Failed to sign out");
      }

      return true;
    },
    onSuccess: () => {
      toast.success("Signed out successfully");
      queryClient.invalidateQueries();
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
