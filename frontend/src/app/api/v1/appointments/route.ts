import { NextResponse } from 'next/server';
import { APPOINTMENTS, Appointment } from '@/lib/hospital-data-manifest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');
  const status = searchParams.get('status');
  
  let filteredAppointments = APPOINTMENTS;
  
  if (patientId) {
    filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId);
  }
  
  if (doctorId) {
    filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === doctorId);
  }
  
  if (status) {
    filteredAppointments = filteredAppointments.filter(apt => apt.status.toLowerCase() === status.toLowerCase());
  }
  
  return NextResponse.json(filteredAppointments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.patientId || !body.doctorId || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, doctorId, date, time' },
        { status: 400 }
      );
    }
    
    // Create new appointment
    const newAppointment: Appointment = {
      id: `APT-${Date.now()}`,
      status: 'Scheduled',
      createdAt: new Date().toISOString().split('T')[0],
      price: 150, // Default price, mock logic
      ...body
    };
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
