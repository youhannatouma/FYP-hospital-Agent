import { NextResponse } from 'next/server';
import { APPOINTMENTS } from '@/lib/hospital-data-manifest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appointment = APPOINTMENTS.find(apt => apt.id === id);
  
  if (!appointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(appointment);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aptIndex = APPOINTMENTS.findIndex(apt => apt.id === id);
  
  if (aptIndex === -1) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    const updatedAppointment = { ...APPOINTMENTS[aptIndex], ...body };
    
    // In a real app, update DB here
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
