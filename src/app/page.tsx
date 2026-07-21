import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FolderKanban, FileText, MessageSquare, BarChart3, Mail, KeyRound, Calendar, CreditCard } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Access",
    description: "Role-based access control with enterprise-grade security",
  },
  {
    icon: Users,
    title: "Pod Collaboration",
    description: "Work with dedicated pods for seamless project delivery",
  },
  {
    icon: FolderKanban,
    title: "Request Management",
    description: "Submit and track requests with real-time status updates",
  },
  {
    icon: FileText,
    title: "Document Hub",
    description: "Centralized document storage and version control",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description: "Communicate with your team in real-time",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track progress, hours, and project metrics",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold">GC³ Portal</span>
          </Link>
          <nav className="flex items-center space-x-2">
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
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Connect
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              Connect with your dedicated GC³ delivery team through a{" "}
              <span className="font-semibold text-primary">secure</span>,{" "}
              <span className="font-semibold text-primary">centralized workspace</span>.{" "}
              Manage{" "}
              <span className="font-semibold text-primary">project requests</span>, monitor
              progress, access{" "}
              <span className="font-semibold text-primary">deliverables</span>, communicate
              seamlessly, and stay informed—all from one intelligent enterprise platform.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login/client">
                <Button size="lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Client Login
                </Button>
              </Link>
              <Link href="/login/staff">
                <Button size="lg" variant="outline">
                  <KeyRound className="mr-2 h-5 w-5" />
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto border-t px-4 py-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">
              Everything You Need
            </h2>
            <p className="mt-2 text-muted-foreground">
              A complete platform for client collaboration
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GC³ Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
