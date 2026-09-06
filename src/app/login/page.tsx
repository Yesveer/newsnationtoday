import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "लॉगिन",
  description: `${siteConfig.name} एडमिन लॉगिन।`,
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-10">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-bold text-text">लॉगिन</h1>
        <p className="text-sm text-text-muted">एडमिन और टीम सदस्यों के लिए।</p>
      </div>
      <LoginForm />
    </div>
  );
}
