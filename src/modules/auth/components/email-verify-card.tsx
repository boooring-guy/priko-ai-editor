"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEmailVerify } from "../api/use-email-verify";

export const otpSchema = z.object({
  otp: z.string().length(6, "Please enter the 6-digit verification code"),
});

export type OtpValues = z.infer<typeof otpSchema>;

interface EmailVerifyCardProps {
  email: string;
}

export const EmailVerifyCard = ({ email }: EmailVerifyCardProps) => {
  const { verifyOtp, isVerifyPending } = useEmailVerify();

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onOtpSubmit = (values: OtpValues) => {
    verifyOtp({ email, otp: values.otp });
  };

  return (
    <Card className="w-full h-full md:w-[487px]">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center items-center gap-2">
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      disabled={isVerifyPending}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isVerifyPending} type="submit" className="w-full">
              {isVerifyPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
