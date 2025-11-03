import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateViewingReport } from '@/lib/ai/report-generator'
import { sendViewingReport } from '@/lib/email'
import { sendVendorNotification } from '@/lib/sms/twilio'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { viewingId } = body

    // Fetch viewing with all related data
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
      include: {
        property: true,
        agent: {
          include: {
            agency: true,
          },
        },
      },
    })

    if (!viewing) {
      return NextResponse.json(
        { error: 'Viewing not found' },
        { status: 404 }
      )
    }

    // Generate report with AI
    const reportContent = await generateViewingReport({
      property: {
        address: viewing.property.address,
        postcode: viewing.property.postcode,
      },
      viewing: {
        date: viewing.viewingDate,
        viewerName: viewing.viewerName,
        viewerPhone: viewing.viewerPhone || undefined,
        viewerEmail: viewing.viewerEmail || undefined,
        interestLevel: viewing.interestLevel,
        financialPosition: viewing.financialPosition,
        seriousness: viewing.seriousness,
        notes: viewing.notes || undefined,
        feedbackPositive: viewing.feedbackPositive || undefined,
        feedbackNegative: viewing.feedbackNegative || undefined,
      },
      agent: {
        name: viewing.agent.name,
      },
      agency: viewing.agent.agency
        ? {
            name: viewing.agent.agency.name,
            phone: viewing.agent.agency.phone || undefined,
          }
        : undefined,
    })

    // Save report
    const report = await prisma.report.create({
      data: {
        viewingId: viewing.id,
        generatedContent: reportContent,
        format: 'EMAIL',
      },
    })

    // Send email to vendor
    let emailDelivered = false
    if (viewing.property.vendorEmail) {
      emailDelivered = await sendViewingReport(
        viewing.property.vendorEmail,
        viewing.property.vendorName,
        viewing.property.address,
        reportContent
      )
    }

    // Send SMS notification
    let smsDelivered = false
    if (viewing.property.vendorPhone) {
      const reportUrl = `${process.env.NEXTAUTH_URL}/reports/${report.id}`
      smsDelivered = await sendVendorNotification(
        viewing.property.vendorPhone,
        viewing.property.vendorName,
        viewing.property.address,
        reportUrl
      )
    }

    // Update report with delivery status
    await prisma.report.update({
      where: { id: report.id },
      data: {
        emailDelivered,
        smsDelivered,
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      reportId: report.id,
      emailDelivered,
      smsDelivered,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
