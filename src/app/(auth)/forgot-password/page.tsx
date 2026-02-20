import { ForgotPasswordCard } from "@/modules/auth/components/forgot-password-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";

export default function ForgotPasswordPage() {
  return (
    <UnauthGuard>
      <ForgotPasswordCard />
    </UnauthGuard>
  );
}
