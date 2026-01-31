import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isTeacher } from '@/lib/teacher'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { courseId, attachmentId } = params
    const { userId } = await auth()

    if (!userId || !isTeacher(userId)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        createdById: userId,
      },
    })

    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const attachment = await db.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error('[ATTACHMENT_DELETE]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
