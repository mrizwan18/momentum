import { z } from "zod";

/**
 * Client-side validation only — this sprint is UI-only (see the plan's
 * "Data & navigation approach"): no repository write happens on submit.
 */
export const onboardingFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  age: z.coerce
    .number()
    .int("Enter a whole number")
    .min(5, "Age must be at least 5")
    .max(120, "Enter a valid age"),
});

/** What RHF's form state actually holds before submit-time coercion (age starts as a string from the input). */
export type OnboardingFormInput = z.input<typeof onboardingFormSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
