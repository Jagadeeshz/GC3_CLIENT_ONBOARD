import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoice_id,
      client_id,
      amount,
      currency = "INR",
      notes,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment verification parameters" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Record the completed payment in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoice_id || null,
        client_id: client_id,
        amount: amount,
        currency: currency,
        status: "completed",
        payment_method: "razorpay",
        stripe_payment_id: razorpay_payment_id, // storing gateway payment id
        notes: notes || `Razorpay Order: ${razorpay_order_id}`,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // If invoice_id is provided, update invoice status if needed
    if (invoice_id) {
      await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoice_id);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
