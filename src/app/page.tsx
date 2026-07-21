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

function EnterpriseWorkspaceSVG() {
  return (
    <svg
      viewBox="0 0 900 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(243 75% 69%)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity="0.05" />
        </linearGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      {/* Ambient glow orbs */}
      <circle cx="200" cy="150" r="120" fill="hsl(243 75% 59%)" opacity="0.04" filter="url(#blur2)">
        <animate attributeName="cx" values="200;240;180;200" dur="20s" repeatCount="indefinite" />
        <animate attributeName="cy" values="150;120;170;150" dur="25s" repeatCount="indefinite" />
      </circle>
      <circle cx="700" cy="400" r="100" fill="hsl(217 91% 60%)" opacity="0.04" filter="url(#blur2)">
        <animate attributeName="cx" values="700;660;730;700" dur="22s" repeatCount="indefinite" />
        <animate attributeName="cy" values="400;370;420;400" dur="18s" repeatCount="indefinite" />
      </circle>
      <circle cx="500" cy="300" r="80" fill="hsl(243 75% 69%)" opacity="0.03" filter="url(#blur2)">
        <animate attributeName="cx" values="500;530;470;500" dur="24s" repeatCount="indefinite" />
        <animate attributeName="cy" values="300;260;330;300" dur="20s" repeatCount="indefinite" />
      </circle>

      {/* Grid pattern */}
      <g opacity="0.03">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`vg${i}`} x1={i * 80} y1="0" x2={i * 80} y2="600" stroke="currentColor" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`hg${i}`} x1="0" y1={i * 80} x2="900" y2={i * 80} stroke="currentColor" strokeWidth="0.5" />
        ))}
      </g>

      {/* === Main dashboard screen (center) === */}
      <g className="animate-float-slow" style={{ transformOrigin: "450px 260px" }}>
        {/* Screen frame */}
        <rect x="250" y="100" width="400" height="260" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.7" />
        <rect x="250" y="100" width="400" height="260" rx="12" fill="url(#screenGlow)" />

        {/* Screen top bar */}
        <rect x="250" y="100" width="400" height="36" rx="12" fill="hsl(var(--muted))" opacity="0.5" />
        <circle cx="270" cy="118" r="5" fill="hsl(0 84% 60%)" opacity="0.4" />
        <circle cx="286" cy="118" r="5" fill="hsl(38 92% 50%)" opacity="0.4" />
        <circle cx="302" cy="118" r="5" fill="hsl(142 71% 45%)" opacity="0.4" />
        <rect x="340" y="112" width="120" height="12" rx="6" fill="hsl(var(--foreground))" opacity="0.06" />

        {/* Dashboard content - stat cards row */}
        <rect x="268" y="148" width="88" height="52" rx="8" fill="hsl(var(--muted))" opacity="0.4" />
        <rect x="364" y="148" width="88" height="52" rx="8" fill="hsl(var(--muted))" opacity="0.4" />
        <rect x="460" y="148" width="88" height="52" rx="8" fill="hsl(var(--muted))" opacity="0.4" />
        <rect x="556" y="148" width="88" height="52" rx="8" fill="hsl(var(--muted))" opacity="0.4" />

        {/* Stat value lines */}
        <rect x="278" y="160" width="40" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.1" />
        <rect x="374" y="160" width="35" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.1" />
        <rect x="470" y="160" width="42" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.1" />
        <rect x="566" y="160" width="38" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.1" />

        {/* Stat label lines */}
        <rect x="278" y="176" width="55" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.05" />
        <rect x="374" y="176" width="50" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.05" />
        <rect x="470" y="176" width="58" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.05" />
        <rect x="566" y="176" width="52" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.05" />

        {/* Chart area */}
        <rect x="268" y="212" width="220" height="130" rx="8" fill="hsl(var(--muted))" opacity="0.3" />

        {/* Bar chart */}
        <rect x="285" y="290" width="16" height="40" rx="3" fill="hsl(243 75% 59%)" opacity="0.3" />
        <rect x="309" y="270" width="16" height="60" rx="3" fill="hsl(243 75% 59%)" opacity="0.4" />
        <rect x="333" y="280" width="16" height="50" rx="3" fill="hsl(243 75% 59%)" opacity="0.35" />
        <rect x="357" y="255" width="16" height="75" rx="3" fill="hsl(243 75% 59%)" opacity="0.5" />
        <rect x="381" y="265" width="16" height="65" rx="3" fill="hsl(243 75% 59%)" opacity="0.45" />
        <rect x="405" y="245" width="16" height="85" rx="3" fill="hsl(243 75% 59%)" opacity="0.6" />
        <rect x="429" y="275" width="16" height="55" rx="3" fill="hsl(243 75% 59%)" opacity="0.38" />
        <rect x="453" y="260" width="16" height="70" rx="3" fill="hsl(217 91% 60%)" opacity="0.45" />

        {/* Table rows */}
        <rect x="496" y="212" width="186" height="130" rx="8" fill="hsl(var(--muted))" opacity="0.3" />
        <rect x="510" y="228" width="160" height="10" rx="5" fill="hsl(var(--foreground))" opacity="0.06" />
        <rect x="510" y="250" width="140" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="510" y="268" width="155" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="510" y="286" width="130" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="510" y="304" width="148" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="510" y="322" width="120" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.04" />
      </g>

      {/* === Left floating card — Team activity === */}
      <g style={{ animation: "float 8s ease-in-out infinite" }}>
        <rect x="40" y="180" width="180" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.6" />
        <rect x="56" y="196" width="60" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.08" />
        <circle cx="68" cy="228" r="14" fill="hsl(243 75% 59%)" opacity="0.12" />
        <circle cx="96" cy="228" r="14" fill="hsl(217 91% 60%)" opacity="0.12" />
        <circle cx="124" cy="228" r="14" fill="hsl(243 75% 69%)" opacity="0.12" />
        <circle cx="152" cy="228" r="14" fill="hsl(142 71% 45%)" opacity="0.12" />
        <rect x="56" y="256" width="148" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="56" y="270" width="100" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
      </g>

      {/* === Right floating card — Analytics === */}
      <g style={{ animation: "float 10s ease-in-out infinite", animationDelay: "2s" }}>
        <rect x="680" y="160" width="190" height="130" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.6" />
        <rect x="696" y="176" width="70" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.08" />

        {/* Mini donut chart */}
        <circle cx="730" cy="224" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.4" />
        <circle cx="730" cy="224" r="22" fill="none" stroke="hsl(243 75% 59%)" strokeWidth="6" opacity="0.35" strokeDasharray="55 130" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 730 224" to="360 730 224" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx="730" cy="224" r="22" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="6" opacity="0.25" strokeDasharray="30 130" strokeDashoffset="-55" strokeLinecap="round" />

        {/* Side metrics */}
        <rect x="764" y="208" width="80" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.05" />
        <rect x="764" y="224" width="60" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.05" />
        <rect x="764" y="240" width="70" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.05" />

        <rect x="696" y="268" width="158" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
      </g>

      {/* === Bottom-left floating card — Messages === */}
      <g style={{ animation: "float 9s ease-in-out infinite", animationDelay: "1s" }}>
        <rect x="60" y="380" width="200" height="120" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.6" />
        <rect x="76" y="396" width="80" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.08" />

        {/* Message bubbles */}
        <rect x="76" y="416" width="110" height="24" rx="12" fill="hsl(243 75% 59%)" opacity="0.1" />
        <rect x="150" y="448" width="96" height="24" rx="12" fill="hsl(var(--muted))" opacity="0.4" />
        <rect x="76" y="480" width="80" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
      </g>

      {/* === Bottom-right floating card — Workflow === */}
      <g style={{ animation: "float 11s ease-in-out infinite", animationDelay: "3s" }}>
        <rect x="640" y="380" width="220" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.6" />
        <rect x="656" y="396" width="90" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.08" />

        {/* Workflow steps */}
        <rect x="656" y="416" width="50" height="28" rx="6" fill="hsl(142 71% 45%)" opacity="0.12" />
        <line x1="710" y1="430" x2="728" y2="430" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.1" />
        <rect x="732" y="416" width="50" height="28" rx="6" fill="hsl(243 75% 59%)" opacity="0.12" />
        <line x1="786" y1="430" x2="804" y2="430" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.1" />
        <rect x="808" y="416" width="36" height="28" rx="6" fill="hsl(217 91% 60%)" opacity="0.12" />

        <rect x="656" y="456" width="178" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
        <rect x="656" y="470" width="130" height="6" rx="3" fill="hsl(var(--foreground))" opacity="0.04" />
      </g>

      {/* === Floating abstract shapes === */}
      <rect x="160" y="80" width="24" height="24" rx="6" fill="hsl(243 75% 59%)" opacity="0.06" style={{ animation: "float 7s ease-in-out infinite" }}>
        <animateTransform attributeName="transform" type="rotate" from="0 172 92" to="360 172 92" dur="20s" repeatCount="indefinite" />
      </rect>
      <circle cx="760" cy="120" r="10" fill="hsl(217 91% 60%)" opacity="0.06" style={{ animation: "float 9s ease-in-out infinite", animationDelay: "1.5s" }} />
      <rect x="380" y="50" width="16" height="16" rx="4" fill="hsl(243 75% 69%)" opacity="0.06" style={{ animation: "float 8s ease-in-out infinite", animationDelay: "0.5s" }}>
        <animateTransform attributeName="transform" type="rotate" from="0 388 58" to="-360 388 58" dur="25s" repeatCount="indefinite" />
      </rect>
      <circle cx="620" cy="530" r="8" fill="hsl(142 71% 45%)" opacity="0.05" style={{ animation: "float 10s ease-in-out infinite", animationDelay: "2.5s" }} />
      <rect x="820" y="310" width="20" height="20" rx="5" fill="hsl(243 75% 59%)" opacity="0.05" style={{ animation: "float 12s ease-in-out infinite", animationDelay: "4s" }}>
        <animateTransform attributeName="transform" type="rotate" from="0 830 320" to="360 830 320" dur="30s" repeatCount="indefinite" />
      </rect>

      {/* Connection lines */}
      <line x1="220" y1="235" x2="250" y2="230" stroke="hsl(243 75% 59%)" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
      <line x1="650" y1="225" x2="680" y2="220" stroke="hsl(243 75% 59%)" strokeWidth="1" opacity="0.08" strokeDasharray="4 4" />
      <line x1="240" y1="340" x2="260" y2="360" stroke="hsl(217 91% 60%)" strokeWidth="1" opacity="0.06" strokeDasharray="4 4" />
      <line x1="640" y1="340" x2="640" y2="380" stroke="hsl(217 91% 60%)" strokeWidth="1" opacity="0.06" strokeDasharray="4 4" />
    </svg>
  );
}

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

          {/* Enterprise workspace illustration — full width, behind text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.55] pointer-events-none select-none" style={{ maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)" }}>
            <div className="w-full max-w-5xl mx-auto px-4">
              <EnterpriseWorkspaceSVG />
            </div>
          </div>

          <div className="relative container mx-auto px-4 py-24 text-center sm:py-32">
            <div className="mx-auto max-w-4xl space-y-8">
              {/* Badge */}
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Modern Enterprise Workspace
              </div>

              {/* Heading */}
              <h1 className="animate-fade-in-up stagger-1 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Empowering Teams.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-info bg-clip-text text-transparent">
                  Delivering Excellence.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="animate-fade-in-up stagger-2 mx-auto max-w-[700px] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Bring teams, clients, and projects together in one secure workspace designed for modern collaboration, intelligent workflows, and exceptional delivery.
              </p>

              {/* Single CTA */}
              <div className="animate-fade-in-up stagger-3 flex flex-col items-center justify-center">
                <Link href="/login/client">
                  <Button size="xl" className="group shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">
                    <Globe className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Partner With Us
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
