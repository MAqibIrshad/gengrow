import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { db } from '@/lib/db'

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
) {
  try {
    const { chapterId, courseId } = params
    const { userId } = await auth()
    const { isPublished, ...values } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const ownCourse = await db.course.findUnique({
      where: { id: courseId, createdById: userId },
    })
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const chapter = await db.chapter.update({
      where: { id: chapterId },
      data: { ...values },
    })

    if (values.videoUrl) {
      // Cleanup existing mux data
      const existingMuxData = await db.muxData.findFirst({ where: { chapterId } })
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId)
        await db.muxData.delete({ where: { id: existingMuxData.id } })
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: 'public',
        test: false,
      })

      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      })
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('[CHAPTER_UPDATE]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(
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
    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 })
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({ where: { chapterId } })
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId)
        await db.muxData.delete({ where: { id: existingMuxData.id } })
      }
    }

    const deletedChapter = await db.chapter.delete({ where: { id: chapterId } })

    const publishedChaptersInCourse = await db.chapter.count({
      where: { courseId, isPublished: true },
    })

    if (!publishedChaptersInCourse) {
      await db.course.update({
        where: { id: courseId },
        data: { isPublished: false },
      })
    }

    return NextResponse.json(deletedChapter)
  } catch (error) {
    console.error('[CHAPTER_DELETE]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
