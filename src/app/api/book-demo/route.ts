import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const LeadSchema = z.object({
  name: z.string().min(1),
  company: z.string().max(255).nullable(),
  email: z.string().email(),
  phone: z.string().max(50).nullable(),
  companySize: z.string().max(50).nullable(),
  service: z.string().max(100).nullable(),
  preferredDemoDate: z.string().nullable(),
  preferredDemoTime: z.string().nullable(),
  message: z.string().max(2000).nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = LeadSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        company_size: data.companySize,
        service: data.service,
        preferred_demo_date: data.preferredDemoDate,
        preferred_demo_time: data.preferredDemoTime,
        message: data.message,
      })
      .single();

    if (error) throw error;
    return NextResponse.json({ lead: result }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
