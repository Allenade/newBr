"use client";

import React, { FC } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/auth/use-auth";
import { Loader2, Mail } from "lucide-react";

type ComponentProps = Record<string, never>;

// ~ ======= create form schema  ======= ~
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

const SignInPage: FC<ComponentProps> = ({}) => {
  const { signIn, isSigningIn } = useAuth();

  // ~ ======= Create form instance ======= ~
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  // ~ ======= Submit handler  ======= ~
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    await signIn(formData);
  };

  return (
    <div className="w-full h-ful l px-4 lg:px-6 pt-10 flex flex-col gap-5">
      {/* ####################################### */}
      {/* -- Header text  --> */}
      {/* ####################################### */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Sign in to your Accout</h2>
        <p className="text-muted-foreground">
          Welcome back to Crypto. Signin to continue or{" "}
          <Link href="/auth/signup" className="underline underline-offset-2">
            Sign up
          </Link>{" "}
          if you are new here.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-lg grid gap-4 grid-cols-4 mt-4"
        >
          {/* ~ ======= Email ======= ~ */}
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    required
                    {...field}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="email"
          />

          {/* ~ ======= Password ======= ~ */}
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="* * * * * * * *"
                    required
                    {...field}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="password"
          />
          <div className="flex items-center justify-between col-span-4 gap-2 w-full">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me">Remember me</Checkbox>
              <Label htmlFor="remember-me">Remember me</Label>
            </div>
            <Link href="/auth/forgot-password">Forgot password?</Link>
          </div>

          {/* ~ ======= Submit button ======= ~ */}
          <div className="mt-5 flex w-full col-span-4 flex-col gap-3">
            <Button size="lg">
              {" "}
              {isSigningIn ? (
                <>
                  <Loader2
                    size={18}
                    strokeWidth={1.3}
                    className="animate-spin mr-2"
                  />
                  <span>Loading... </span>
                </>
              ) : (
                <>
                  <Mail size={18} strokeWidth={1.3} className="mr-2" />
                  <span>Continue with email</span>
                </>
              )}
            </Button>

            <Button size="lg" variant="outline">
              Continue with Google
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SignInPage;
