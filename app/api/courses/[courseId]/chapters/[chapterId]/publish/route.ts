import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
) {
  try {
    const { chapterId, courseId } = params
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const ownCourse = await db.course.findUnique({
      where: { id: courseId, createdById: userId },
    })

    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId, courseId },
    })

    const muxData = await db.muxData.findUnique({
      where: { chapterId },
    })

    if (![chapter, muxData, chapter?.title, chapter?.description, chapter?.videoUrl].every(Boolean)) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const publishedChapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: true },
    })

    return NextResponse.json(publishedChapter)
  } catch (error) {
    console.error('[CHAPTER_PUBLISH]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
