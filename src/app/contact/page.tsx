import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "संपर्क करें",
  description: `${siteConfig.name} की टीम से संपर्क करें।`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">संपर्क करें</h1>
        <p className="text-text-muted">कोई खबर, सुझाव या शिकायत? हमें नीचे दिए गए फ़ॉर्म से बताएं।</p>
        <a href={`mailto:${siteConfig.email}`} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-accent hover:underline">
          <Mail className="size-4" /> {siteConfig.email}
        </a>
      </Reveal>

      <Reveal>
        <ContactForm />
      </Reveal>
    </div>
  );
}
