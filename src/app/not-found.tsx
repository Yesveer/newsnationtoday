import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="font-display text-2xl font-bold text-text">यह पेज नहीं मिला</h1>
      <p className="text-text-muted">जिस खबर या पेज को आप खोज रहे हैं, वह उपलब्ध नहीं है या हटा दिया गया है।</p>
      <LinkButton href="/">होम पर जाएं</LinkButton>
      <Link href="/search" className="text-sm text-accent hover:underline">
        या खबर खोजें
      </Link>
    </div>
  );
}
