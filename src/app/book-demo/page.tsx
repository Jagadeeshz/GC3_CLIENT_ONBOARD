"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle2, Loader2 } from "lucide-react";

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const SERVICES = [
  "Project Management",
  "Pod-based Operations",
  "Client Collaboration",
  "Document Management",
  "Analytics & Reporting",
  "Custom Integration",
];

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  companySize: string;
  service: string;
  demoDate: string;
  demoTime: string;
  message: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  companySize?: string;
  service?: string;
  demoDate?: string;
  demoTime?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!data.company.trim()) {
    errors.company = "Company name is required.";
  }

  if (!data.email.trim()) {
    errors.email = "Work email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[\d\s\-+()]{7,}$/.test(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!data.companySize) {
    errors.companySize = "Please select a company size.";
  }

  if (!data.service) {
    errors.service = "Please select a service.";
  }

  if (!data.demoDate) {
    errors.demoDate = "Please select a preferred date.";
  } else {
    const selected = new Date(data.demoDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.demoDate = "Please select a future date.";
    }
  }

  if (!data.demoTime) {
    errors.demoTime = "Please select a preferred time.";
  }

  if (!data.message.trim()) {
    errors.message = "Please provide a brief message.";
  }

  return errors;
}

export default function BookDemoPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    companySize: "",
    service: "",
    demoDate: "",
    demoTime: "",
    message: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success("Demo request submitted successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">GC³ Portal</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <Card className="w-full max-w-md text-center">
            <CardContent className="space-y-6 pt-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Demo Request Received!</h2>
                <p className="text-muted-foreground">
                  Thank you, {formData.name}. We&apos;ve received your demo request for{" "}
                  <span className="font-medium text-foreground">{formData.company}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Our team will reach out to you at{" "}
                  <span className="font-medium text-foreground">{formData.email}</span> within 24
                  hours to confirm your demo session.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/">
                  <Button className="w-full">Back to Home</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Book a Demo
            </h1>
            <p className="text-muted-foreground">
              See how GC³ can transform your client operations. Fill out the form
              below and our team will schedule a personalized demo for you.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Demo Request Form</CardTitle>
              <CardDescription>
                All fields are required. We&apos;ll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.company && (
                      <p className="text-sm text-destructive">{errors.company}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@acme.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => updateField("companySize", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.companySize && (
                      <p className="text-sm text-destructive">{errors.companySize}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Service Interested In</Label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) => updateField("service", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.service && (
                      <p className="text-sm text-destructive">{errors.service}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="demoDate">Preferred Demo Date</Label>
                    <Input
                      id="demoDate"
                      type="date"
                      value={formData.demoDate}
                      onChange={(e) => updateField("demoDate", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.demoDate && (
                      <p className="text-sm text-destructive">{errors.demoDate}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demoTime">Preferred Demo Time</Label>
                    <Input
                      id="demoTime"
                      type="time"
                      value={formData.demoTime}
                      onChange={(e) => updateField("demoTime", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.demoTime && (
                      <p className="text-sm text-destructive">{errors.demoTime}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your needs and what you'd like to see in the demo..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Demo Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
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
