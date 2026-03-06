import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, username } from "better-auth/plugins";
import { db } from "@/db";
import { envs } from "@/envs";
import OtpEmail from "@/modules/email/templates/otp-email";
import WelcomeEmail from "@/modules/email/templates/welcome-email";
import { resend } from "./resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "https://tunnel.pro-track.app",
    "*.pro-track.app",
    "next.pro-track.app",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: (() => {
        const url = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const hostname = new URL(url).hostname;
        // For localhost, don't set a domain (let the browser handle it)
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return undefined;
        }
        // For deployed domains, use the root domain (e.g., ".pro-track.app")
        const parts = hostname.split(".");
        return `.${parts.slice(-2).join(".")}`;
      })(),
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in" || type === "email-verification") {
          try {
            const result = await resend.emails.send({
              from: envs.EMAIL_FROM,
              to: email,
              subject: "Your verification code for Priko",
              react: OtpEmail({ otp }),
            });
            console.log("Resend OTP result:", result);
          } catch (error) {
            console.error("Failed to send OTP email:", error);
          }
        }
      },
      sendVerificationOnSignUp: true,
    }),
    username(),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, _request) => {
      try {
        const result = await resend.emails.send({
          from: envs.EMAIL_FROM,
          to: user.email,
          subject: "Reset your Priko password",
          html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password.</p>`,
        });
        console.log("Resend Reset Password result:", result);
      } catch (error) {
        console.error("Failed to send Reset Password email:", error);
      }
    },
  },
  emailVerification: {
    requireEmailVerification: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      // we use emailOTP plugin, this isn't strictly necessary but required when emailVerification is enabled
    },
    afterEmailVerification: async (user, _request) => {
      // We safely assert here because we have defined firstName in our schema, BetterAuth's hook typing doesn't infer it correctly yet.
      const firstName = (user as any).firstName;
      try {
        const result = await resend.emails.send({
          from: envs.EMAIL_FROM,
          to: user.email,
          subject: "Welcome to Priko!",
          react: WelcomeEmail({ name: user.name ?? firstName }),
        });
        console.log("Resend Welcome result:", result);
      } catch (error) {
        console.error("Failed to send Welcome email:", error);
      }
    },
  },
  user: {
    additionalFields: {
      image: {
        type: "string",
        required: false,
      },
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      isBanned: {
        type: "boolean",
        required: false,
      },
      publicMetadata: {
        type: "string", // will be treated as string by better-auth
        required: false,
      },
      privateMetadata: {
        type: "string",
        required: false,
      },
    },
  },
});
