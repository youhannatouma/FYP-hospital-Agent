import { NextResponse } from 'next/server';
import { USERS, User } from '@/lib/hospital-data-manifest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  
  let filteredUsers = USERS;
  
  if (role) {
    filteredUsers = USERS.filter(user => user.role.toLowerCase() === role.toLowerCase());
  }
  
  return NextResponse.json(filteredUsers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.name || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, role' },
        { status: 400 }
      );
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      joined: new Date().toISOString(),
      status: 'Pending',
      lastActive: 'Just now',
      ...body
    };
    
    // In a real app, we would save to DB here
    // For mock, we just return the new user as if it was created
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
