"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Calendar, Lock, User } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Heading,
  Input,
  Reveal,
  Text,
  shadowStyle,
} from "@momentum/ui";
import { useStorage } from "@/providers/storage-provider";
import {
  onboardingFormSchema,
  type OnboardingFormValues,
  type OnboardingFormInput,
} from "../lib/onboarding-schema";

export interface NameAgeFormProps {
  onBack: () => void;
  onNext: () => void;
}

/** Screen 06: back button + Name/Age form + Continue. */
export function NameAgeForm({ onBack, onNext }: NameAgeFormProps) {
  const storage = useStorage();
  const form = useForm<OnboardingFormInput, unknown, OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: { name: "", age: undefined },
    mode: "onSubmit",
  });

  async function handleValid(values: OnboardingFormValues) {
    await storage.users.setDisplayName(values.name);
    await storage.users.setAge(values.age);
    onNext();
  }

  return (
    <div
      className="flex flex-col gap-6 px-6 pt-8 pb-6"
      style={{ minHeight: "100dvh" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{ height: "44px", width: "44px", ...shadowStyle.iconChip }}
        className="flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>

      <Reveal className="flex flex-col gap-2">
        <Heading as="h1" style={{ fontSize: "1.5rem", lineHeight: 1.2 }}>
          Almost there! 👋
        </Heading>
        <Text tone="muted">Please enter your details to get started.</Text>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-1 flex-col">
        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-5"
            onSubmit={form.handleSubmit(handleValid)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      leadingIcon={
                        <User aria-hidden="true" className="h-4 w-4" />
                      }
                      placeholder="Enter your name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Age</FormLabel>
                  <FormControl>
                    <Input
                      leadingIcon={
                        <Calendar aria-hidden="true" className="h-4 w-4" />
                      }
                      trailingText="Years"
                      placeholder="Enter your age"
                      type="number"
                      inputMode="numeric"
                      {...field}
                      value={
                        field.value === undefined ? "" : String(field.value)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              style={{ marginTop: "auto" }}
              className="flex flex-col gap-3 pt-6"
            >
              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                className="h-14 w-full gap-2 text-base font-semibold"
              >
                Continue
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Button>
              <Text
                tone="muted"
                size="sm"
                className="flex items-center justify-center gap-1.5"
              >
                <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                Your data is safe and secure.
              </Text>
            </div>
          </form>
        </Form>
      </Reveal>
    </div>
  );
}
