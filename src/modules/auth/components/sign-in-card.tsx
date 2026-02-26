"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useSignIn } from "../api/use-sign-in";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const SignInCard = () => {
  const { signIn, isSignPending } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInValues) => {
    signIn(values);
  };

  return (
    <Card className="w-full h-full md:w-[487px]">
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>
                          <Mail className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="john@example.com"
                        type="email"
                        autoComplete="email"
                        disabled={isSignPending}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isSignPending}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex h-full items-center justify-center px-2 text-muted-foreground hover:text-foreground focus:outline-none"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
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
            <Button disabled={isSignPending} type="submit" className="w-full">
              {isSignPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center flex-col gap-4">
        <p className="text-body-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
