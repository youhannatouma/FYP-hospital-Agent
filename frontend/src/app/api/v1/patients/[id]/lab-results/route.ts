import { NextResponse } from 'next/server';
import { LAB_RESULTS, LabResult } from '@/lib/hospital-data-manifest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const results = LAB_RESULTS.filter(lab => lab.patientId === id);
  
  return NextResponse.json(results);
}
