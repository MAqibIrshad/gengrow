import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isTeacher } from '@/lib/teacher'

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const { userId } = await auth()
    const { title } = await req.json()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: { id: courseId, createdById: userId },
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const lastChapter = await db.chapter.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    const newChapter = await db.chapter.create({
      data: { title, courseId, position: newPosition },
    })

    return NextResponse.json(newChapter)
  } catch (error) {
    console.error('[CHAPTER_POST]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
