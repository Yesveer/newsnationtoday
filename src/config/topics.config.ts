export interface Topic {
  slug: string;
  name: string;
  nameEn: string;
  /** Short visual marker shown on the tile — a state code, a flag emoji, or a sport emoji. */
  badge: string;
  color: string;
}

/** Indian states + the most newsworthy UTs. */
export const stateTopics: Topic[] = [
  { slug: "up", name: "उत्तर प्रदेश", nameEn: "Uttar Pradesh", badge: "UP", color: "#E23744" },
  { slug: "mh", name: "महाराष्ट्र", nameEn: "Maharashtra", badge: "MH", color: "#F26B21" },
  { slug: "dl", name: "दिल्ली", nameEn: "Delhi", badge: "DL", color: "#7C3AED" },
  { slug: "mp", name: "मध्य प्रदेश", nameEn: "Madhya Pradesh", badge: "MP", color: "#0EA5E9" },
  { slug: "rj", name: "राजस्थान", nameEn: "Rajasthan", badge: "RJ", color: "#EC4899" },
  { slug: "br", name: "बिहार", nameEn: "Bihar", badge: "BR", color: "#16A34A" },
  { slug: "gj", name: "गुजरात", nameEn: "Gujarat", badge: "GJ", color: "#F59E0B" },
  { slug: "ka", name: "कर्नाटक", nameEn: "Karnataka", badge: "KA", color: "#06B6D4" },
  { slug: "tn", name: "तमिलनाडु", nameEn: "Tamil Nadu", badge: "TN", color: "#8B5CF6" },
  { slug: "wb", name: "पश्चिम बंगाल", nameEn: "West Bengal", badge: "WB", color: "#10B981" },
  { slug: "pb", name: "पंजाब", nameEn: "Punjab", badge: "PB", color: "#F43F5E" },
  { slug: "hr", name: "हरियाणा", nameEn: "Haryana", badge: "HR", color: "#6366F1" },
  { slug: "rc", name: "छत्तीसगढ़", nameEn: "Chhattisgarh", badge: "CG", color: "#A855F7" },
  { slug: "jh", name: "झारखंड", nameEn: "Jharkhand", badge: "JH", color: "#EAB308" },
  { slug: "or", name: "ओडिशा", nameEn: "Odisha", badge: "OD", color: "#14B8A6" },
  { slug: "ap", name: "आंध्र प्रदेश", nameEn: "Andhra Pradesh", badge: "AP", color: "#EF4444" },
  { slug: "ts", name: "तेलंगाना", nameEn: "Telangana", badge: "TS", color: "#3B82F6" },
  { slug: "kl", name: "केरल", nameEn: "Kerala", badge: "KL", color: "#22C55E" },
  { slug: "as", name: "असम", nameEn: "Assam", badge: "AS", color: "#D946EF" },
  { slug: "uk", name: "उत्तराखंड", nameEn: "Uttarakhand", badge: "UK", color: "#0891B2" },
  { slug: "hp", name: "हिमाचल प्रदेश", nameEn: "Himachal Pradesh", badge: "HP", color: "#F97316" },
  { slug: "jk", name: "जम्मू-कश्मीर", nameEn: "Jammu & Kashmir", badge: "JK", color: "#64748B" },
  { slug: "gaya", name: "गोवा", nameEn: "Goa", badge: "GA", color: "#FB7185" },
  { slug: "mn", name: "मणिपुर", nameEn: "Manipur", badge: "MN", color: "#84CC16" },
];

/** Countries an Indian newsroom covers most. */
export const countryTopics: Topic[] = [
  { slug: "usa", name: "अमेरिका", nameEn: "United States", badge: "🇺🇸", color: "#3B82F6" },
  { slug: "china", name: "चीन", nameEn: "China", badge: "🇨🇳", color: "#E23744" },
  { slug: "pakistan", name: "पाकिस्तान", nameEn: "Pakistan", badge: "🇵🇰", color: "#16A34A" },
  { slug: "russia", name: "रूस", nameEn: "Russia", badge: "🇷🇺", color: "#6366F1" },
  { slug: "britain", name: "ब्रिटेन", nameEn: "United Kingdom", badge: "🇬🇧", color: "#7C3AED" },
  { slug: "uae", name: "यूएई", nameEn: "UAE", badge: "🇦🇪", color: "#F59E0B" },
  { slug: "nepal", name: "नेपाल", nameEn: "Nepal", badge: "🇳🇵", color: "#EC4899" },
  { slug: "bangladesh", name: "बांग्लादेश", nameEn: "Bangladesh", badge: "🇧🇩", color: "#10B981" },
  { slug: "japan", name: "जापान", nameEn: "Japan", badge: "🇯🇵", color: "#F43F5E" },
  { slug: "australia", name: "ऑस्ट्रेलिया", nameEn: "Australia", badge: "🇦🇺", color: "#0EA5E9" },
  { slug: "canada", name: "कनाडा", nameEn: "Canada", badge: "🇨🇦", color: "#EF4444" },
  { slug: "france", name: "फ्रांस", nameEn: "France", badge: "🇫🇷", color: "#8B5CF6" },
  { slug: "germany", name: "जर्मनी", nameEn: "Germany", badge: "🇩🇪", color: "#EAB308" },
  { slug: "srilanka", name: "श्रीलंका", nameEn: "Sri Lanka", badge: "🇱🇰", color: "#F97316" },
  { slug: "saudi", name: "सऊदी अरब", nameEn: "Saudi Arabia", badge: "🇸🇦", color: "#22C55E" },
  { slug: "israel", name: "इज़राइल", nameEn: "Israel", badge: "🇮🇱", color: "#06B6D4" },
];

/** Sports disciplines for the sports hub. */
export const sportTopics: Topic[] = [
  { slug: "cricket", name: "क्रिकेट", nameEn: "Cricket", badge: "🏏", color: "#16A34A" },
  { slug: "football", name: "फुटबॉल", nameEn: "Football", badge: "⚽", color: "#3B82F6" },
  { slug: "hockey", name: "हॉकी", nameEn: "Hockey", badge: "🏑", color: "#F26B21" },
  { slug: "kabaddi", name: "कबड्डी", nameEn: "Kabaddi", badge: "🤼", color: "#EC4899" },
  { slug: "badminton", name: "बैडमिंटन", nameEn: "Badminton", badge: "🏸", color: "#8B5CF6" },
  { slug: "tennis", name: "टेनिस", nameEn: "Tennis", badge: "🎾", color: "#EAB308" },
  { slug: "athletics", name: "एथलेटिक्स", nameEn: "Athletics", badge: "🏃", color: "#06B6D4" },
  { slug: "wrestling", name: "कुश्ती", nameEn: "Wrestling", badge: "🤸", color: "#E23744" },
  { slug: "chess", name: "शतरंज", nameEn: "Chess", badge: "♟️", color: "#64748B" },
  { slug: "olympics", name: "ओलंपिक", nameEn: "Olympics", badge: "🏅", color: "#F59E0B" },
];

/** Compact helper — sub-topics for the remaining category hubs. */
function t(slug: string, name: string, nameEn: string, badge: string, color: string): Topic {
  return { slug, name, nameEn, badge, color };
}

export const deshTopics: Topic[] = [
  t("shiksha", "शिक्षा", "Education", "🎓", "#7C3AED"),
  t("swasthya", "स्वास्थ्य", "Health", "🏥", "#16A34A"),
  t("railway", "रेलवे", "Railways", "🚆", "#0EA5E9"),
  t("digital", "डिजिटल", "Digital", "📡", "#6366F1"),
  t("suraksha", "सुरक्षा", "Security", "🛡️", "#E23744"),
  t("krishi", "कृषि", "Agriculture", "🌾", "#F59E0B"),
];

export const rajnitiTopics: Topic[] = [
  t("loksabha", "लोकसभा", "Lok Sabha", "🏛️", "#E23744"),
  t("rajyasabha", "राज्यसभा", "Rajya Sabha", "🏢", "#7C3AED"),
  t("chunav", "चुनाव", "Elections", "🗳️", "#F26B21"),
  t("vipaksh", "विपक्ष", "Opposition", "🤝", "#0EA5E9"),
];

export const cricketTopics: Topic[] = [
  t("test", "टेस्ट", "Test", "🏏", "#16A34A"),
  t("odi", "वनडे", "ODI", "🥎", "#3B82F6"),
  t("t20", "टी-20", "T20", "⚡", "#F59E0B"),
  t("ipl", "आईपीएल", "IPL", "🏆", "#EC4899"),
  t("mahila", "महिला क्रिकेट", "Women's", "👩", "#D946EF"),
  t("gharelu", "घरेलू", "Domestic", "🏟️", "#0EA5E9"),
];

export const manoranjanTopics: Topic[] = [
  t("filmein", "फिल्में", "Movies", "🎬", "#D946EF"),
  t("webseries", "वेब सीरीज़", "Web Series", "📺", "#6366F1"),
  t("sangeet", "संगीत", "Music", "🎵", "#EC4899"),
  t("puraskar", "पुरस्कार", "Awards", "🏆", "#F59E0B"),
];

export const vyaparTopics: Topic[] = [
  t("bazaar", "शेयर बाज़ार", "Markets", "📈", "#16A34A"),
  t("startup", "स्टार्टअप", "Startups", "🚀", "#6366F1"),
  t("banking", "बैंकिंग", "Banking", "🏦", "#0EA5E9"),
  t("sona", "सोना-चांदी", "Gold", "🪙", "#F59E0B"),
  t("tax", "टैक्स", "Tax", "🧾", "#64748B"),
];

export const techTopics: Topic[] = [
  t("mobile", "मोबाइल", "Mobile", "📱", "#6366F1"),
  t("ai", "एआई", "AI", "🤖", "#7C3AED"),
  t("car", "कार", "Cars", "🚗", "#E23744"),
  t("bike", "बाइक", "Bikes", "🏍️", "#F26B21"),
  t("cyber", "साइबर", "Cyber", "🔐", "#0EA5E9"),
];

export const tejaswiniTopics: Topic[] = [
  t("udyamita", "उद्यमिता", "Enterprise", "🌱", "#16A34A"),
  t("career", "करियर", "Career", "💼", "#6366F1"),
  t("khel", "खेल", "Sports", "🏅", "#F59E0B"),
  t("prerna", "प्रेरणा", "Inspiration", "✨", "#EC4899"),
];

export const investigationTopics: Topic[] = [
  t("padtal", "पड़ताल", "Probe", "🔍", "#0EA5E9"),
  t("ground", "ग्राउंड रिपोर्ट", "Ground Report", "📍", "#F26B21"),
  t("factcheck", "फैक्ट चेक", "Fact Check", "✅", "#16A34A"),
];

export const khaasTopics: Topic[] = [
  t("paryavaran", "पर्यावरण", "Environment", "🌿", "#16A34A"),
  t("samaj", "समाज", "Society", "🤝", "#EC4899"),
  t("sanskriti", "संस्कृति", "Culture", "🎭", "#F59E0B"),
];

export const originalsTopics: Topic[] = [
  t("documentary", "डॉक्यूमेंट्री", "Documentary", "🎥", "#E23744"),
  t("series", "सीरीज़", "Series", "📚", "#6366F1"),
  t("video", "वीडियो", "Video", "▶️", "#F26B21"),
];

export const jobsTopics: Topic[] = [
  t("sarkari", "सरकारी नौकरी", "Govt Jobs", "🏛️", "#7C3AED"),
  t("result", "रिजल्ट", "Results", "📊", "#16A34A"),
  t("admission", "एडमिशन", "Admission", "🎓", "#0EA5E9"),
  t("skill", "स्किल", "Skills", "🛠️", "#F59E0B"),
];

export const lifestyleTopics: Topic[] = [
  t("sehat", "सेहत", "Health", "💚", "#16A34A"),
  t("fashion", "फैशन", "Fashion", "👗", "#EC4899"),
  t("khanpan", "खानपान", "Food", "🍲", "#F26B21"),
  t("yatra", "यात्रा", "Travel", "✈️", "#0EA5E9"),
  t("ghar", "घर", "Home", "🏡", "#F59E0B"),
];

export const jeevanTopics: Topic[] = [
  t("prerna", "प्रेरणा", "Inspiration", "✨", "#F59E0B"),
  t("rishte", "रिश्ते", "Relationships", "❤️", "#EC4899"),
  t("safalta", "सफलता", "Success", "🎯", "#16A34A"),
  t("dhyan", "ध्यान", "Mindfulness", "🧘", "#6366F1"),
];

export const opinionTopics: Topic[] = [
  t("sampadakiya", "संपादकीय", "Editorial", "✍️", "#64748B"),
  t("vishleshan", "विश्लेषण", "Analysis", "📊", "#0EA5E9"),
  t("column", "कॉलम", "Column", "📰", "#7C3AED"),
];

export const rashifalTopics: Topic[] = [
  t("dainik", "दैनिक", "Daily", "📅", "#A855F7"),
  t("saptahik", "साप्ताहिक", "Weekly", "🗓️", "#6366F1"),
  t("masik", "मासिक", "Monthly", "🌙", "#0EA5E9"),
  t("varshik", "वार्षिक", "Yearly", "⭐", "#F59E0B"),
];

/** Which hub each category uses, and which search placeholder it shows. */
export const categoryTopics: Record<string, { topics: Topic[]; searchKey: string }> = {
  rajya: { topics: stateTopics, searchKey: "topic.searchState" },
  videsh: { topics: countryTopics, searchKey: "topic.searchCountry" },
  khel: { topics: sportTopics, searchKey: "topic.searchSport" },
  desh: { topics: deshTopics, searchKey: "topic.search" },
  rajniti: { topics: rajnitiTopics, searchKey: "topic.search" },
  cricket: { topics: cricketTopics, searchKey: "topic.search" },
  manoranjan: { topics: manoranjanTopics, searchKey: "topic.search" },
  vyapar: { topics: vyaparTopics, searchKey: "topic.search" },
  tech: { topics: techTopics, searchKey: "topic.search" },
  tejaswini: { topics: tejaswiniTopics, searchKey: "topic.search" },
  investigation: { topics: investigationTopics, searchKey: "topic.search" },
  khaas: { topics: khaasTopics, searchKey: "topic.search" },
  originals: { topics: originalsTopics, searchKey: "topic.search" },
  jobs: { topics: jobsTopics, searchKey: "topic.search" },
  lifestyle: { topics: lifestyleTopics, searchKey: "topic.search" },
  "jeevan-mantra": { topics: jeevanTopics, searchKey: "topic.search" },
  opinion: { topics: opinionTopics, searchKey: "topic.search" },
  rashifal: { topics: rashifalTopics, searchKey: "topic.search" },
};
