import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const leadSchema = z.object({
  role: z.enum(['owner', 'renter']),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = leadSchema.parse(body)

    // Log the lead data (in production, this would be saved to a database)
    console.log('Lead captured:', {
      role: validatedData.role,
      email: validatedData.email,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    })

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email marketing list
    // 4. Update waitlist count

    return NextResponse.json({
      status: 'ok',
      message: 'Lead captured successfully'
    })

  } catch (error) {
    console.error('Error processing lead:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
