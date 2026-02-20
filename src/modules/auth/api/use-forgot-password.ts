import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useForgotPassword = () => {
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // @ts-ignore
      const { data, error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      if (error) throw new Error(error.message || "Failed to send reset link");
      return data;
    },
    onSuccess: () => {
      toast.success("Password reset link sent to your email");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    sendResetLink: resetPasswordMutation.mutate,
    isPending: resetPasswordMutation.isPending,
  };
};
