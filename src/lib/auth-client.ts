import { emailOTPClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL
    : window.location.origin;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [emailOTPClient(), usernameClient()],
});

export const { signIn, signOut, signUp, sendVerificationEmail, emailOtp } =
  authClient;
