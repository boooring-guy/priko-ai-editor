import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useEmailVerify = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
        fetchOptions: {
          onSuccess: () => {},
        },
      });
      if (error) throw new Error(error.message || "Invalid OTP");
      return data;
    },
    onSuccess: () => {
      toast.success("Account verified successfully");
      queryClient.invalidateQueries();
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    verifyOtp: verifyOtpMutation.mutate,
    isVerifyPending: verifyOtpMutation.isPending,
  };
};
