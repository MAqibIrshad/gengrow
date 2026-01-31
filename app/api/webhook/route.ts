import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new NextResponse('Missing Stripe-Signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[STRIPE_WEBHOOK_ERROR]', errMessage)
    return new NextResponse(`Webhook error: ${errMessage}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session?.metadata?.userId
  const courseId = session?.metadata?.courseId

  switch (event.type) {
    case 'checkout.session.completed':
      if (!userId || !courseId) {
        console.error('[STRIPE_WEBHOOK_ERROR] Missing metadata', event)
        return new NextResponse('Webhook error: Missing metadata', { status: 400 })
      }

      await db.purchase.create({
        data: { userId, courseId },
      })
      console.log(`[STRIPE_WEBHOOK] Purchase created: user ${userId}, course ${courseId}`)
      break

    default:
      console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`)
  }

  // Always respond 2xx for Stripe
  return new NextResponse(null, { status: 200 })
}
