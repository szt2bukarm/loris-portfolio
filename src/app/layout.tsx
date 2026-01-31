import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ViewTransitions } from 'next-view-transitions';
import NavLogo from "@/components/Common/NavLogo";
import SmoothScroll from "./SmoothScroll";
import MobileTest from "./MobileTest";
import ContactWrapper from "@/components/ContactCTA/ContactWrapper";
import Loader from "./Loader";

import { Analytics } from "@vercel/analytics/next"

import TabTitleLooper from "./TabTitleLooper";

export const metadata: Metadata = {
  title: "Loris Bukvic Portfolio",
  description: "Loris Bukvic is an award winning website and multimedia designer. Specializing in premium website design, user experience, and interactive storytelling. ",
  keywords: [
    "Loris Bukvic",
    "Bukvity Lorisz",
    "Loris Bukvic",
    "Lorisz Bukvity",
    "Web Designer",
    "Multimedia Designer",
    "Creative Developer",
    "UI/UX Design",
    "Award Winning",
    "Webflow",
    "Interactive Design",
    "Bespoke Websites",
    "Branding",
    "Frontend Developer",
  ],
  openGraph: {
    title: "Loris Bukvic Portfolio",
    description: "Loris Bukvic is an award winning website and multimedia designer. Specializing in premium website design, user experience, and interactive storytelling.",
    url: "https://www.lorisbukvic.graphics",
    siteName: "Loris Bukvic Webdesign Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.lorisbukvic.graphics/og.webp",
        width: 1200,
        height: 630,
        alt: "Loris Bukvic Webdesign Portfolio",
      },
    ]
  },
  icons: {
    icon: "/icons/logo.svg",
  }
};

const intranet = localFont({
  src: "../../public/fonts/IntraNet.otf",
  variable: "--font-intranet",
});

const ppRegular = localFont({
  src: "../../public/fonts/PPMori-Regular.otf",
  variable: "--font-ppregular",
});

const ppSemiBold = localFont({
  src: "../../public/fonts/PPMori-SemiBold.otf",
  variable: "--font-ppsemibold",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${intranet.variable} ${ppRegular.variable} ${ppSemiBold.variable}`}>
        <head>
          <script
            dangerouslySetInnerHTML={{ __html: `history.scrollRestoration = "manual"` }}
          />
        </head>
        <body>
          <Loader />
          <NavLogo />
          <SmoothScroll>
            <MobileTest />
            <TabTitleLooper />
            <ContactWrapper />
            {children}
            <Analytics />
          </SmoothScroll>
        </body>
      </html>
    </ViewTransitions>
  );
}
