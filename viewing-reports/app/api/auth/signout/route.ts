import { NextResponse } from 'next/server'

export async function POST() {
  // In a real app, clear session/JWT here
  return NextResponse.json({ success: true })
}
