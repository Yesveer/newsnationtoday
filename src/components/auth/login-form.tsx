"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PillButton } from "@/components/ui/pill-button";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

const loginSchema = z.object({
  email: z.string().email("कृपया एक मान्य ईमेल दर्ज करें"),
  password: z.string().min(1, "पासवर्ड दर्ज करें"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** The newsroom sign-in. It talks to the Go API and then hands over to the
 *  admin portal, which picks the session up from the refresh cookie. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const next = searchParams.get("next") ?? "/admin";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.login(values.email, values.password);
      router.replace(next);
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fields ?? {})) {
          if (field === "email" || field === "password") setError(field, { message });
        }
        setFormError(error.message);
        return;
      }
      setFormError("सर्वर से संपर्क नहीं हो पाया। कृपया थोड़ी देर बाद कोशिश कीजिए।");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {formError}
        </p>
      )}

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

      <PillButton type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "जांचा जा रहा है…" : "लॉगिन करें"}
      </PillButton>

      <p className="text-center text-xs leading-relaxed text-text-muted">
        अकाउंट सिर्फ़ एडमिनिस्ट्रेटर बनाता है। पासवर्ड भूल गए हों तो उन्हीं से रीसेट कराइए।
      </p>
    </form>
  );
}
