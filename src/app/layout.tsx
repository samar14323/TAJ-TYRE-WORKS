import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DeveloperConsole from "@/components/ui/DeveloperConsole";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tajtyreworks.com"),
  title: "Taj Tyre Works | Tyres, Tubes, Wheel Alignment, Batteries",
  description: "Taj Tyre Works offers premium tyres, tubes, batteries, wheel alignment, wheel balancing, nitrogen filling, puncture repair and automotive services.",
  keywords: [
    "tyre shop Raipur", "wheel alignment Raipur", "wheel balancing Chhattisgarh",
    "nitrogen air filling", "automotive battery replacement", "tubeless tyre repair",
    "Taj Tyre Works", "car tyres Raipur", "bike tyres Raipur"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Taj Tyre Works | Tyres, Tubes, Wheel Alignment, Batteries",
    description: "Taj Tyre Works offers premium tyres, tubes, batteries, wheel alignment, wheel balancing, nitrogen filling, puncture repair and automotive services.",
    url: "https://www.tajtyreworks.com",
    siteName: "Taj Tyre Works",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Taj Tyre Works - Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taj Tyre Works | Tyres, Tubes, Wheel Alignment, Batteries",
    description: "Taj Tyre Works offers premium tyres, tubes, batteries, wheel alignment, wheel balancing, nitrogen filling, puncture repair and automotive services.",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Injected structured data markup
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      "name": "Taj Tyre Works",
      "image": "https://www.tajtyreworks.com/favicon.ico",
      "@id": "https://www.tajtyreworks.com/#localbusiness",
      "url": "https://www.tajtyreworks.com",
      "telephone": "+9199936181",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Moudhapara, Behind Gurudwara",
        "addressLocality": "Raipur",
        "addressRegion": "Chhattisgarh",
        "postalCode": "492001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 21.2514,
        "longitude": 81.6296
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "21:00"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.tajtyreworks.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Stock Catalog",
          "item": "https://www.tajtyreworks.com/customer/stock"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What services does Taj Tyre Works offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Taj Tyre Works offers premium tyres, tubes, automatic 3D wheel alignment, balancing, nitrogen filling, battery diagnostics, and professional puncture repairs."
          }
        },
        {
          "@type": "Question",
          "name": "How can I check active warranties on tyres purchased from Taj Tyre Works?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can sign in to the Customer Portal using your registered phone number via OTP to check active tyre serial numbers, installation dates, and real-time warranty remaining timers."
          }
        }
      ]
    }
  ];

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {children}
        <DeveloperConsole />
      </body>
    </html>
  );
}

