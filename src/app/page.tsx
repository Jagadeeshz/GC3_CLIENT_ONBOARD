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
  Calendar,
  CreditCard,
  Sparkles,
  Zap,
  Globe,
  Lock,
  Headphones,
  LayoutDashboard,
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

const stats = [
  { label: "Active Teams", value: "50+" },
  { label: "Projects Delivered", value: "500+" },
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Enterprise Clients", value: "120+" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">GC</span>
            </div>
            <span className="text-lg font-bold tracking-tight">GC³ Portal</span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Link href="/login/staff">
              <Button variant="ghost" size="sm" className="group">
                <Shield className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Team Hub
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button variant="ghost" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Book Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Pricing
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0 mesh-gradient" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "linear-gradient(135deg, hsl(243 75% 59% / 0.04) 0%, transparent 40%, hsl(217 91% 60% / 0.03) 70%, transparent 100%)",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 12s ease infinite",
            }}
          />

          {/* Floating orbs */}
          <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-primary/[0.06] blur-[100px] animate-orb-1" />
          <div className="absolute bottom-[10%] right-[15%] h-64 w-64 rounded-full bg-info/[0.05] blur-[80px] animate-orb-2" />
          <div className="absolute right-[40%] top-[50%] h-48 w-48 rounded-full bg-primary/[0.04] blur-[60px] animate-orb-3" />

          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative container mx-auto px-4 py-24 text-center sm:py-32">
            <div className="mx-auto max-w-4xl space-y-8">
              {/* Badge */}
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise-Grade Collaboration Platform
              </div>

              {/* Heading */}
              <h1 className="animate-fade-in-up stagger-1 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Connect with your
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-info bg-clip-text text-transparent">
                  delivery team
                </span>
              </h1>

              {/* Subtitle */}
              <p className="animate-fade-in-up stagger-2 mx-auto max-w-[700px] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                A{" "}
                <span className="font-semibold text-foreground">secure, centralized workspace</span>{" "}
                for managing requests, monitoring progress, accessing deliverables, and collaborating with your dedicated GC³ team.
              </p>

              {/* CTAs */}
              <div className="animate-fade-in-up stagger-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login/client">
                  <Button size="xl" className="group shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
                    <Globe className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Partner With Us
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login/staff">
                  <Button size="lg" variant="outline" className="group glass backdrop-blur-sm">
                    <Lock className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Team Hub
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="animate-fade-in-up stagger-4 mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-t">
          {/* Subtle background */}
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
                  {/* Hover gradient accent */}
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
        <section className="relative border-t overflow-hidden">
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
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="/login/client">
                  <Button size="lg" className="group shadow-lg shadow-primary/20">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/book-demo">
                  <Button size="lg" variant="outline">
                    Book a Demo
                  </Button>
                </Link>
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
