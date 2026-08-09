import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinks = [
  { label: "हमारे बारे में", href: "/about" },
  { label: "संपर्क करें", href: "/contact" },
  { label: "विज्ञापन दें", href: "/contact" },
  { label: "गोपनीयता नीति", href: "/about" },
  { label: "नियम व शर्तें", href: "/about" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-muted">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} {siteConfig.name}. सर्वाधिकार सुरक्षित।
        </p>
      </div>
    </footer>
  );
}
