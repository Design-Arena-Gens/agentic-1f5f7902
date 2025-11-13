import { NextRequest, NextResponse } from 'next/server';
import { FeatureSchema } from '../../../lib/schema';
import { predict } from '../../../lib/model';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FeatureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = predict(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
