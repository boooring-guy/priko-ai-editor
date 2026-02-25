"use client";

import Link from "next/link";
import { AvatarUpload } from "@/modules/user/components/avatar-upload";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignUp } from "../api/use-sign-up";

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  image: z.instanceof(File).optional().nullable(),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const SignUpCard = () => {
  const { signUp, isSignPending } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      image: null,
    },
  });

  const onSubmit = (values: SignUpValues) => {
    signUp({
      ...values,
      name: `${values.firstName} ${values.lastName}`.trim(),
    });
  };

  return (
    <Card className="w-full h-full md:w-121.75">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Join us today by creating a new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex justify-center flex-col items-center">
                  <AvatarUpload onFileSelect={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>
                            <User className="size-4" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          placeholder="John"
                          autoComplete="given-name"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>
                            <User className="size-4" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          placeholder="Doe"
                          autoComplete="family-name"
                          disabled={isSignPending}
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>
                          <AtSign className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="johndoe"
                        autoComplete="username"
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
                        placeholder="Create a strong password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
