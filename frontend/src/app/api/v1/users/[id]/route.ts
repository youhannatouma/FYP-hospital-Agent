import { NextResponse } from 'next/server';
import { USERS } from '@/lib/hospital-data-manifest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = USERS.find(u => u.id === id);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userIndex = USERS.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    const updatedUser = { ...USERS[userIndex], ...body };
    
    // In a real app, we would update DB here
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
