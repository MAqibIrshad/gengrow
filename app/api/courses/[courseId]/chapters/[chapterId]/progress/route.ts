import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { chapterId } = params
    const { userId } = await auth()
    const { isCompleted } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userProgress = await db.userProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isCompleted },
      create: { userId, chapterId, isCompleted },
    })

    return NextResponse.json(userProgress)
  } catch (error) {
    console.error('[USER_PROGRESS_UPDATE]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
