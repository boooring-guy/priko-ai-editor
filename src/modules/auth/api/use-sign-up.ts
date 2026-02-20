import { signUp } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSignUp = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async (values: Parameters<typeof signUp.email>[0]) => {
      const { data, error } = await signUp.email({
        ...values,
        fetchOptions: {
          onSuccess: () => {}, // Prevent default redirect
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to sign up");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Verification code sent to your email");
      router.push(`/email-verify?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    signUp: signUpMutation.mutate,
    isSignPending: signUpMutation.isPending,
  };
};
