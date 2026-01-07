// PHASE 1: NextAuth/Prisma disabled - using localStorage instead
import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../auth/[...nextauth]/route'
// import { prisma } from '@/lib/prisma'

export async function GET() {
  // PHASE 1: Return users from localStorage sync endpoint
  // This endpoint is used by admin panel to get users
  // In Phase 1, we return users from the sync storage (which is localStorage-based)
  
  try {
    // For now, return empty array or error
    // The admin panel should use localStorage directly via getUsers()
    // This API route will be re-enabled in Phase 3 after Prisma is fixed
    
    return NextResponse.json({
      success: true,
      users: [],
      message: 'PHASE 1: Use localStorage directly. This API will work after Prisma is fixed in Phase 2.'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
  
  /* PHASE 3: Re-enable after Prisma is fixed
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can access user list
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
  */
}


