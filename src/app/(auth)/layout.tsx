import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Animated gradient + branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-background lg:flex lg:items-center lg:justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 mesh-gradient-dark" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(135deg, hsl(243 75% 59% / 0.08) 0%, transparent 40%, hsl(217 91% 60% / 0.06) 60%, transparent 100%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 12s ease infinite",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-primary/[0.07] blur-[80px] animate-orb-1" />
        <div className="absolute bottom-[20%] right-[10%] h-80 w-80 rounded-full bg-info/[0.06] blur-[100px] animate-orb-2" />
        <div className="absolute right-[30%] top-[60%] h-48 w-48 rounded-full bg-primary/[0.05] blur-[60px] animate-orb-3" />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-md px-8 text-center">
          {/* Premium illustration */}
          <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-10 w-10 text-primary"
              aria-hidden="true"
            >
              <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="28" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="4" y="28" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="28" y="28" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M20 14h8M20 34h8M12 20v8M36 20v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Enterprise Client Portal
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Connect with your dedicated delivery team through a secure, centralized workspace.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["Real-time collaboration", "Secure access", "Project tracking", "Analytics"].map(
              (feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border/50 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                >
                  {feature}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — Login form */}
      <div className="relative flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        {/* Subtle background accents */}
        <div className="absolute right-[-10%] top-[-10%] h-96 w-96 rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-80 w-80 rounded-full bg-info/[0.03] blur-[100px]" />

        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Mobile-only logo */}
          <div className="text-center lg:hidden">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-sm font-bold text-primary-foreground">GC</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">GC³ Portal</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Enterprise Client Portal
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
