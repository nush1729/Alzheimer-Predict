import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ClientProvider from "@/components/ClientProvider";

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
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased relative selection:bg-brand-cyan/30 selection:text-white`}>
        
        {/* Top Gradient Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-panel border-x-0 border-t-0 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-white to-brand-cyan bg-clip-text text-transparent tracking-tight">
              AlzPredict AI
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/" className="text-slate-300 hover:text-brand-cyan transition-colors">Overview</Link>
            <Link href="/diagnostic" className="text-slate-300 hover:text-brand-cyan transition-colors">Diagnostic Suite</Link>
            <Link href="/explain" className="text-slate-300 hover:text-brand-cyan transition-colors">Explainability</Link>
            <Link href="/analytics" className="text-slate-300 hover:text-brand-cyan transition-colors">System Audit</Link>
            <Link href="/science" className="text-slate-300 hover:text-brand-cyan transition-colors">Science</Link>
          </div>

          <Link href="/diagnostic" className="px-5 py-2 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded-full text-xs font-bold tracking-wider hover:bg-brand-cyan hover:text-black transition-all duration-300 uppercase">
            Run Diagnosis
          </Link>
        </nav>

        <ClientProvider>
          {/* Core Content Container */}
          <main className="pt-16 min-h-screen relative overflow-hidden">
            {children}
          </main>
        </ClientProvider>
        
        {/* Background glowing orbs */}
        <div className="fixed top-1/4 -left-20 w-96 h-96 bg-brand-cyan/10 rounded-full filter blur-[100px] opacity-50 pointer-events-none -z-10 animate-glow-pulse"></div>
        <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-brand-purple/10 rounded-full filter blur-[100px] opacity-50 pointer-events-none -z-10 animate-glow-pulse" style={{animationDelay: '2s'}}></div>
      </body>
    </html>
  );
}
