import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Mock availability logic
  // Returns available slots for the next 7 days
  
  const slots = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Skip weekends for mock logic
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    slots.push(
      { date: dateString, time: '09:00 AM', available: true },
      { date: dateString, time: '10:00 AM', available: true },
      { date: dateString, time: '02:00 PM', available: true },
      { date: dateString, time: '03:30 PM', available: true }
    );
  }
  
  return NextResponse.json({
    doctorId: id,
    availableSlots: slots
  });
}
