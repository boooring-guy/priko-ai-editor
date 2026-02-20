import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useResetPassword = () => {
  const router = useRouter();

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      password,
      token,
    }: {
      password: string;
      token?: string;
    }) => {
      // @ts-ignore
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token, // if token is undefined, better-auth tries to pull it from the URL
      });
      if (error) throw new Error(error.message || "Failed to reset password");
      return data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully. You can now log in.");
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    resetPassword: resetPasswordMutation.mutate,
    isPending: resetPasswordMutation.isPending,
  };
};
