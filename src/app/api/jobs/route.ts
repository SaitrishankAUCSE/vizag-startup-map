import { NextRequest, NextResponse } from 'next/server';
import { getActiveJobs, createJob, toggleJobStatus, deleteJob } from '@/lib/supabase/service';
import { z } from 'zod';

const createJobSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  title: z.string().min(2, 'Job title must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  applyUrl: z.string().url('A valid URL is required'),
});

export async function GET() {
  try {
    const jobs = await getActiveJobs();
    return NextResponse.json({ jobs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { listingId, title, location, applyUrl } = parsed.data;
    const result = await createJob(listingId, title, location, applyUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, job: result.job }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, isActive } = body;

    if (!jobId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'jobId and isActive boolean required' }, { status: 400 });
    }

    const ok = await toggleJobStatus(jobId, isActive);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId parameter required' }, { status: 400 });
    }

    const ok = await deleteJob(jobId);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
