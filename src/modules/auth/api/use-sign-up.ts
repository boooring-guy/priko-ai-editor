import { signUp } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadPublicFile } from "@/modules/user/server/upload-actions";
import { SignUpValues } from "../components/sign-up-card";

export const useSignUp = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpValues & { name: string }) => {
      let imageUrl: string | undefined;

      if (values.image) {
        console.log("📸 Image detected in form, starting upload...");
        const formData = new FormData();
        formData.append("file", values.image);
        const uploadResult = await uploadPublicFile(formData);

        if (uploadResult.success) {
          imageUrl = uploadResult.url;
          console.log("✅ Image uploaded to S3 successfully:", imageUrl);
        } else {
          console.error("❌ S3 Upload failed:", uploadResult.error);
        }
      } else {
        console.log("ℹ️ No image provided in signup form.");
      }

      console.log(
        "🚀 Executing BetterAuth signUp.email with image:",
        imageUrl || "NULL",
      );

      const { data, error } = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        username: values.username,
        image: imageUrl,
        fetchOptions: {
          onSuccess: (ctx: any) => {
            console.log("🎉 BetterAuth signup success!", ctx.data.user);
          },
          onError: (ctx: any) => {
            console.error("❌ BetterAuth signup error context:", ctx.error);
          },
        },
      } as any);

      if (error) {
        console.error("❌ BetterAuth error response:", error);
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
