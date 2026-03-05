import { NextResponse } from 'next/server';
import { MEDICAL_RECORDS, MedicalRecord } from '@/lib/hospital-data-manifest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = MEDICAL_RECORDS.filter(rec => rec.patientId === id);
  
  return NextResponse.json(records);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.doctorId || !body.date || !body.diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newRecord: MedicalRecord = {
      id: `REC-${Date.now()}`,
      patientId: id,
      patientName: "Unknown", // In real app, fetch from DB
      status: 'Active',
      ...body
    };
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
