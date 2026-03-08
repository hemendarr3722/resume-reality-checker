import "./globals.css";
import Providers from "./providers";
import TopNav from "@/components/TopNav";

export const metadata = {
  title: "Resume Reality Checker — AI-Powered Resume Analysis",
  description: "Upload your resume and job description. Get ATS scores, missing keywords, red flags, and specific fixes — powered by AI. Track every version like Git.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          <TopNav />
          <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
