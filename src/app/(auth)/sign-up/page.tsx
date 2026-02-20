import { SignUpCard } from "@/modules/auth/components/sign-up-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";

export default function SignUpPage() {
  return (
    <UnauthGuard>
      <SignUpCard />
    </UnauthGuard>
  );
}
