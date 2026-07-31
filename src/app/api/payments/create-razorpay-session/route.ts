import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, receipt, notes } = body;
    if (!amount || !currency || !receipt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const order = await createRazorpayOrder({ amount, currency, receipt, notes });
    return NextResponse.json({ order_id: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
