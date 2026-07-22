import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  FolderKanban,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
  Headphones,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Access",
    description: "Enterprise-grade role-based access control with end-to-end encryption",
  },
  {
    icon: Users,
    title: "Pod Collaboration",
    description: "Dedicated delivery pods for seamless cross-functional project execution",
  },
  {
    icon: FolderKanban,
    title: "Request Management",
    description: "Submit, track, and manage requests with real-time status visibility",
  },
  {
    icon: FileText,
    title: "Document Hub",
    description: "Centralized document storage with version control and secure sharing",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description: "Instant team communication with persistent message history",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track progress, hours, revenue, and project performance metrics",
  },
];

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Solutions", href: "#features" },
  { label: "About", href: "#trust" },
  { label: "Resources", href: "#features" },
  { label: "Contact", href: "#trust" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <nav className="liquid-glass-nav rounded-2xl px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo + Team Hub */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <span className="font-serif text-xl italic tracking-tight text-white">
                    GC3 Portal
                  </span>
                </Link>
                <Link
                  href="/login/staff"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                >
                  <Shield className="h-3 w-3" />
                  Team Hub
                </Link>
              </div>

              {/* Center: Nav links */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-all duration-300 hover:text-white hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Right: Mobile menu button */}
              <div className="flex items-center gap-3">
                <button className="lg:hidden rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section — Fullscreen Video */}
        <section className="relative h-screen min-h-[600px] overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              type="video/mp4"
            />
          </video>

          {/* Content overlay */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="mx-auto max-w-4xl px-4 text-center">
              {/* Heading */}
              <h1 className="fade-rise font-serif text-5xl font-normal italic tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
                Empowering Teams.
                <br />
                <span className="text-white/50">
                  Delivering Excellence.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="fade-rise-delay mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
                Bring teams, clients, and projects together in one secure enterprise workspace designed to simplify communication, accelerate collaboration, and deliver exceptional results through intelligent workflows.
              </p>

              {/* CTA */}
              <div className="fade-rise-delay-2 mt-14">
                <Link
                  href="/login/client"
                  className="group relative inline-flex items-center gap-3 rounded-full border border-white/30 bg-[rgba(255,255,255,0.12)] px-10 py-5 text-lg font-semibold text-white shadow-[0_8px_40px_rgba(79,70,229,0.45)] backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_40px_rgba(79,70,229,0.55)] hover:border-white/40 hover:bg-[rgba(255,255,255,0.18)] active:scale-[0.98]"
                >
                  <Globe className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  Partner With Us
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </section>

        {/* Features Section */}
        <section id="features" className="relative">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 py-24">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Built for Modern Teams
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                A complete platform for enterprise client collaboration
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card
                  key={feature.title}
                  className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)} group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardHeader className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 mb-2">
                      <feature.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Trust Section */}
        <section id="trust" className="relative border-t overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="relative container mx-auto px-4 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Industry Leaders
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Join 120+ enterprises who rely on GC³ Portal for secure project management,
                real-time collaboration, and transparent delivery workflows.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="group shadow-lg shadow-primary/20" asChild>
                  <Link href="/login/client">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/book-demo">Book a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GC³ Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
