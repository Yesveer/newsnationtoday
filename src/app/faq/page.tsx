import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "अक्सर पूछे जाने वाले सवाल",
  description: `${siteConfig.name} से जुड़े सामान्य सवालों के जवाब।`,
};

const faqs = [
  {
    question: `${siteConfig.name} क्या है?`,
    answer:
      "यह एक डिजिटल न्यूज़ प्लेटफ़ॉर्म है जो राष्ट्रीय और क्षेत्रीय खबरें, राजनीति, खेल, मनोरंजन, व्यापार और तकनीक से जुड़ी जानकारी एक ही जगह उपलब्ध कराता है।",
  },
  {
    question: "खबरें कितनी बार अपडेट होती हैं?",
    answer: "होमपेज और श्रेणी पेज पूरे दिन ताज़ा खबरों के साथ अपडेट होते रहते हैं, खासकर ब्रेकिंग न्यूज़ के दौरान।",
  },
  {
    question: "मैं किसी खबर में गलती की रिपोर्ट कैसे करूं?",
    answer: "कृपया संपर्क/फ़ीडबैक पेज पर दिए गए फ़ॉर्म से हमें सूचित करें — हमारी टीम जल्द से जल्द इसकी समीक्षा करेगी।",
  },
  {
    question: "क्या मुझे पढ़ने के लिए लॉगिन करना ज़रूरी है?",
    answer: "नहीं, सभी खबरें बिना लॉगिन के मुफ़्त में पढ़ी जा सकती हैं। लॉगिन फ़िलहाल केवल हमारी टीम के लिए है।",
  },
  {
    question: "क्या वेबसाइट डार्क मोड सपोर्ट करती है?",
    answer: "हां, ऊपर दिए गए थीम बटन से आप लाइट, डार्क या सिस्टम डिफ़ॉल्ट थीम में से कोई भी चुन सकते हैं।",
  },
  {
    question: "मैं सुझाव या शिकायत कैसे भेज सकता हूं?",
    answer: "फ़ीडबैक लिंक पर जाकर दिए गए फ़ॉर्म से अपना सुझाव, शिकायत या खबर से जुड़ी जानकारी हमें भेज सकते हैं।",
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="border-b border-border pb-3 text-2xl font-bold text-text">अक्सर पूछे जाने वाले सवाल</h1>
      <div className="flex flex-col">
        {faqs.map((faq) => (
          <div key={faq.question} className="border-b border-border py-4 last:border-b-0">
            <h2 className="mb-1.5 font-semibold text-text">{faq.question}</h2>
            <p className="text-sm leading-relaxed text-text-muted">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
