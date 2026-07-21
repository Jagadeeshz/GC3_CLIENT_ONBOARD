import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Clock, Users } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "$499",
    hours: "20 hours/month",
    pods: "1 Pod",
    features: [
      "Up to 2 team members",
      "Basic request management",
      "Document storage",
      "Email support",
      "Standard analytics",
    ],
    recommended: false,
  },
  {
    name: "Professional",
    monthlyPrice: "$1,499",
    hours: "80 hours/month",
    pods: "3 Pods",
    features: [
      "Up to 10 team members",
      "Advanced request management",
      "Real-time collaboration",
      "Priority support",
      "Advanced analytics & reporting",
      "Custom integrations",
      "Dedicated account manager",
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    hours: "Unlimited hours",
    pods: "Unlimited Pods",
    features: [
      "Unlimited team members",
      "Full platform access",
      "Custom pod structure",
      "24/7 dedicated support",
      "Custom analytics & BI",
      "API access & integrations",
      "SLA guarantee",
      "Onboarding & training",
    ],
    recommended: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">GC³ Portal</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground">
              Choose the plan that fits your team. All plans include core platform features.
              Need something custom? Contact our sales team.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.recommended
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-1 text-xs font-semibold">
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.monthlyPrice}</span>
                    {plan.monthlyPrice !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.pods}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/book-demo" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.recommended ? "default" : "outline"}
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </CardFooter>
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
