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

const SignUpPage: FC<ComponentProps> = ({}) => {
  const { signUpWithEmail, isSigningUp } = useAuth();

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
    await signUpWithEmail(formData);
  };

  return (
    <div className="w-full h-ful l px-4 lg:px-6 pt-10 flex flex-col gap-5">
      {/* ####################################### */}
      {/* -- Header text  --> */}
      {/* ####################################### */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Welcome to Crypto</h2>
        <p className="text-muted-foreground">
          Create an account to get started or{" "}
          <Link href="/auth/signin" className="underline underline-offset-2">
            Sign in
          </Link>{" "}
          if you have one
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-lg grid gap-4 grid-cols-4 mt-4"
        >
          {/* ~ ======= First name ======= ~ */}
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input required {...field} className="" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="firstName"
          />

          {/* ~ ======= Last name ======= ~ */}
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input required {...field} className="" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="lastName"
          />

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

          {/* ~ ======= Submit button ======= ~ */}
          <div className="mt-5 flex w-full col-span-4 flex-col gap-3">
            <Button size="lg">
              {isSigningUp ? (
                <>
                  <Loader2
                    size={18}
                    strokeWidth={1.3}
                    className="animate-spin mr-2"
                  />
                  <span>Signing you up... </span>
                </>
              ) : (
                <>
                  <Mail size={18} strokeWidth={1.3} className="mr-2" />
                  <span>Create account</span>
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

export default SignUpPage;
