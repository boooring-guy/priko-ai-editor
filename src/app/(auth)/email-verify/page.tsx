"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { EmailVerifyCard } from "@/modules/auth/components/email-verify-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";

function EmailVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/sign-in");
    }
  }, [email, router]);

  if (!email) return null;

  return <EmailVerifyCard email={email} />;
}

export default function EmailVerifyPage() {
  return (
    <UnauthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerifyContent />
      </Suspense>
    </UnauthGuard>
  );
}
