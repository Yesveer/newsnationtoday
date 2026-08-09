import type { Metadata } from "next";
import Image from "next/image";
import { authors } from "@/data/authors";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "हमारे बारे में",
  description: `${siteConfig.name} की टीम और हमारे काम करने के तरीके के बारे में जानें।`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">हमारे बारे में</h1>
        <p className="text-text-muted">
          {siteConfig.name} एक स्वतंत्र डिजिटल न्यूज़रूम है, जो राष्ट्रीय और क्षेत्रीय खबरों को तेज़ी से, सटीक तरीके से और बिना
          भ्रामक सुर्खियों के पाठकों तक पहुंचाने के लिए बनाया गया है। हमारा मानना है कि पत्रकारिता का काम शोर मचाना नहीं,
          बल्कि साफ़ और भरोसेमंद जानकारी देना है।
        </p>
        <p className="text-text-muted">
          हमारी टीम देश, राज्य, राजनीति, खेल, मनोरंजन, व्यापार और तकनीक — हर क्षेत्र की खबरों पर बारीकी से नज़र रखती है, ताकि आपको
          एक ही जगह पर पूरी तस्वीर मिल सके।
        </p>
      </Reveal>

      <Reveal className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold text-text">हमारी टीम</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {authors.map((author) => (
            <Card key={author.id} className="flex items-center gap-4 p-5">
              {author.avatarUrl && (
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-display font-semibold text-text">{author.name}</p>
                <p className="text-sm text-text-muted">{author.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
