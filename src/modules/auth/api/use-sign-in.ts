import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, signIn } from "@/lib/auth-client";

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: async (values: Parameters<typeof signIn.email>[0]) => {
      const { data, error } = await signIn.email(values);

      if (error) {
        throw new Error(error.message || "Failed to sign in");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Signed in successfully");
      queryClient.invalidateQueries();
      router.push("/");
    },
    onError: async (error, variables) => {
      if (
        error.message.toLowerCase().includes("not verified") ||
        error.message.toLowerCase().includes("unverified")
      ) {
        toast.info("Email not verified. Redirecting to verification...");
        const { error: sendError } =
          await authClient.emailOtp.sendVerificationOtp({
            email: variables.email,
            type: "email-verification",
          });

        if (sendError) {
          toast.error("Failed to send verification code.");
        } else {
          router.push(
            `/email-verify?email=${encodeURIComponent(variables.email)}`,
          );
        }
      } else {
        toast.error(error.message);
      }
    },
  });

  return {
    signIn: signInMutation.mutate,
    isSignPending: signInMutation.isPending,
  };
};
