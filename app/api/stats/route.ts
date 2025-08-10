import { NextResponse } from 'next/server'

export async function GET() {
  // Return current waitlist count - in real implementation this would come from database
  return NextResponse.json({
    waitlistCount: 0 // Will be updated as leads are captured
  })
}
