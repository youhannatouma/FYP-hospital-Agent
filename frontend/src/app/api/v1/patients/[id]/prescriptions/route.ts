import { NextResponse } from 'next/server';
import { PRESCRIPTIONS, Prescription } from '@/lib/hospital-data-manifest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prescriptions = PRESCRIPTIONS.filter(pre => pre.patientId === id);
  
  return NextResponse.json(prescriptions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.doctorId || !body.date || !body.medicines) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newPrescription: Prescription = {
      id: `PRE-${Date.now()}`,
      patientId: id,
      patientName: "Unknown", // In real app, fetch from DB
      status: 'Active',
      ...body
    };
    
    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
