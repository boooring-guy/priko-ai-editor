import { ResetPasswordCard } from "@/modules/auth/components/reset-password-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <UnauthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordCard />
      </Suspense>
    </UnauthGuard>
  );
}
