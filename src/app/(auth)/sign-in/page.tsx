import { SignInCard } from "@/modules/auth/components/sign-in-card";
import { UnauthGuard } from "@/modules/auth/components/unauth-guard";

export default function SignInPage() {
  return (
    <UnauthGuard>
      <SignInCard />
    </UnauthGuard>
  );
}
