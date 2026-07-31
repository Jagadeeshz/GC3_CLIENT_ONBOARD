"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutButtonProps {
  invoiceId?: string;
  clientId: string;
  amount: number; // in standard currency units (e.g. INR/USD)
  currency?: string;
  notes?: Record<string, string>;
  label?: string;
  className?: string;
}

export function RazorpayCheckoutButton({
  invoiceId,
  clientId,
  amount,
  currency = "INR",
  notes,
  label = "Pay with Razorpay",
  className,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await loadScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // Convert amount to smallest currency unit (paise for INR, cents for USD) if needed, or assume amount is in smallest unit or standard unit.
      // Razorpay expects amount in paise (e.g. 100 INR = 10000 paise). Let's convert amount * 100 if currency is INR/USD, or pass amount directly if already in smallest unit. Usually amount in invoices is in dollars/rupees, so amount * 100.
      const amountInPaise = Math.round(amount * 100);

      const response = await fetch("/api/payments/create-razorpay-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: invoiceId ? `inv_${invoiceId}` : `rcpt_${Date.now()}`,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create Razorpay order");
      }

      const { order_id, key } = data;

      const options = {
        key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency,
        name: "GC³ Portal",
        description: invoiceId ? `Invoice payment #${invoiceId}` : "Client payment",
        order_id: order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify-razorpay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoice_id: invoiceId,
                client_id: clientId,
                amount: amount,
                currency,
                notes: notes ? JSON.stringify(notes) : undefined,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Payment successful and verified!");
            router.refresh();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#0f172a",
        },
      };

      const razorpayObject = new (window as any).Razorpay(options);
      razorpayObject.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong with Razorpay checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading} className={className}>
      {loading ? "Processing..." : label}
    </Button>
  );
}
