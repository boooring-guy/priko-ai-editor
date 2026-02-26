import { Suspense } from "react";
import { ResetPasswordCard } from "@/modules/auth/components/reset-password-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";

export default function ResetPasswordPage() {
  return (
    <UnauthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordCard />
      </Suspense>
    </UnauthGuard>
  );
}
