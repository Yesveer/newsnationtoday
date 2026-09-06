"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("कृपया एक मान्य ईमेल दर्ज करें"),
  password: z.string().min(6, "पासवर्ड कम से कम 6 अक्षर का होना चाहिए"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** Auth backend isn't wired up yet (Phase 2) — this shows the real form, but is honest about not logging anyone in. */
export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-6 text-center">
        <p className="font-semibold text-text">लॉगिन फ़िलहाल उपलब्ध नहीं है</p>
        <p className="mt-1 text-sm text-text-muted">
          एडमिन लॉगिन की सुविधा जल्द आ रही है। तब तक कृपया बिना लॉगिन के खबरें पढ़ते रहें।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text">
          ईमेल
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text">
          पासवर्ड
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1">
        लॉगिन करें
      </Button>
    </form>
  );
}
