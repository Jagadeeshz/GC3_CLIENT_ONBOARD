import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            GC³ Portal
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Enterprise Client Portal
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
