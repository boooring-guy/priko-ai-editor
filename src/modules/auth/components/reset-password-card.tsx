"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useResetPassword } from "../api/use-reset-password";

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordCard = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const { resetPassword, isPending } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    resetPassword({ password: values.password, token });
  };

  return (
    <Card className="w-full h-full md:w-[487px]">
      <CardHeader>
        <CardTitle>Create new password</CardTitle>
        <CardDescription>
          Your new password must be different from previous used passwords.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>
                          <Lock className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="Enter your new password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isPending}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex h-full items-center justify-center px-2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Eye className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>
                          <Lock className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="Confirm your new password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isPending}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="flex h-full items-center justify-center px-2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Eye className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit" className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
