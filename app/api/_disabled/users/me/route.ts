// PHASE 1: NextAuth/Prisma disabled - using localStorage instead
import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../auth/[...nextauth]/route'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  // PHASE 1: This endpoint is disabled
  // Client-side code should use getSessionUser() from @/lib/auth instead
  // This will be re-enabled in Phase 3 after Prisma is fixed
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'PHASE 1: Use getSessionUser() from @/lib/auth instead. This API will work after Prisma is fixed in Phase 2.' 
    },
    { status: 404 }
  )
  
  /* PHASE 3: Re-enable after Prisma is fixed
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        orders: true,
        totalSpent: true,
        visibleGiftCards: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
  */
}


