"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "कृपया अपना पूरा नाम दर्ज करें"),
  email: z.string().email("कृपया एक मान्य ईमेल दर्ज करें"),
  subject: z.string().min(3, "विषय कम से कम 3 अक्षर का होना चाहिए"),
  message: z.string().min(10, "संदेश कम से कम 10 अक्षर का होना चाहिए"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  function onSubmit() {
    setSubmitted(true);
    reset();
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-6 text-center">
        <p className="font-display text-lg font-semibold text-text">धन्यवाद!</p>
        <p className="mt-1 text-sm text-text-muted">आपका संदेश मिल गया है, हमारी टीम जल्द ही आपसे संपर्क करेगी।</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-text">
          नाम
        </label>
        <input
          id="name"
          {...register("name")}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text">
          ईमेल
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-text">
          विषय
        </label>
        <input
          id="subject"
          {...register("subject")}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text">
          संदेश
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus-visible:border-accent"
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        संदेश भेजें
      </Button>
    </form>
  );
}
