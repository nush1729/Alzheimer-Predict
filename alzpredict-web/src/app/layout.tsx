import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ClientProvider from "@/components/ClientProvider";
import { Fingerprint } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AlzPredict AI — Enterprise Diagnostics",
  description: "Advanced, explainable AI platform for predicting Alzheimer's Disease risk with deep SHAP explainability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased relative selection:bg-brand-cyan/30 selection:text-white bg-[#07070B]`}>
        
        {/* Top Gradient Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass-panel border-x-0 border-t-0 backdrop-blur-xl">
          <Link href="/" className="flex items-center space-x-3 shrink-0 select-none">
            <Fingerprint className="text-brand-cyan w-7 h-7 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-xl font-display font-black bg-gradient-to-r from-white to-brand-cyan bg-clip-text text-transparent tracking-tight">
              AlzPredict AI
            </span>
          </Link>
          
          {/* Symmetrical Navigation Capsules */}
          <div className="hidden md:flex items-center gap-4 text-sm font-bold flex-1 justify-center">
            {[
              { label: "Overview", href: "/" },
              { label: "Diagnostic Suite", href: "/diagnostic" },
              { label: "Explainability", href: "/explain" },
              { label: "System Audit", href: "/analytics" },
              { label: "Science", href: "/science" },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 select-none whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="shrink-0">
            <Link href="/diagnostic" className="px-6 py-2.5 bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/40 text-brand-cyan rounded-full text-xs font-black tracking-widest hover:from-brand-cyan hover:to-brand-blue hover:text-black hover:scale-[1.03] transition-all duration-300 uppercase shadow-lg select-none">
              Run Diagnosis
            </Link>
          </div>
        </nav>

        <ClientProvider>
          {/* Core Symmetrical Scalable Viewport Container */}
          <main className="pt-24 pb-20 min-h-screen w-full flex flex-col items-center relative">
            <div className="w-full max-w-7xl px-4 md:px-8 z-10">
              {children}
            </div>
          </main>
        </ClientProvider>
        
        {/* Background glowing orbs */}
        <div className="fixed top-1/4 -left-20 w-96 h-96 bg-brand-cyan/10 rounded-full filter blur-[100px] opacity-50 pointer-events-none -z-10 animate-glow-pulse"></div>
        <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-brand-purple/10 rounded-full filter blur-[100px] opacity-50 pointer-events-none -z-10 animate-glow-pulse" style={{animationDelay: '2s'}}></div>
      </body>
    </html>
  );
}
