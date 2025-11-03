import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      propertyAddress,
      postcode,
      vendorName,
      vendorEmail,
      vendorPhone,
      viewerName,
      viewerEmail,
      viewerPhone,
      viewingDate,
      interestLevel,
      financialPosition,
      seriousness,
      notes,
      feedbackPositive,
      feedbackNegative,
    } = body

    // TODO: Get actual user ID from session
    // For MVP, we'll create a test user or use a hardcoded ID
    const userId = 'test-user-id' // Replace with actual auth

    // First, create or find the property
    // For MVP, we'll create a new property each time
    // In production, you'd want to search for existing properties

    const property = await prisma.property.create({
      data: {
        address: propertyAddress,
        postcode,
        propertyType: 'HOUSE', // Default for MVP
        vendorName,
        vendorEmail: vendorEmail || null,
        vendorPhone: vendorPhone || null,
        status: 'ACTIVE',
        agencyId: 'default-agency', // Replace with actual agency ID
        addedById: userId,
      },
    })

    // Create the viewing
    const viewing = await prisma.viewing.create({
      data: {
        propertyId: property.id,
        agentId: userId,
        viewingDate: new Date(viewingDate),
        viewerName,
        viewerEmail: viewerEmail || null,
        viewerPhone: viewerPhone || null,
        interestLevel,
        financialPosition,
        seriousness,
        notes: notes || null,
        feedbackPositive: feedbackPositive || null,
        feedbackNegative: feedbackNegative || null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        viewingId: viewing.id,
        propertyId: property.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create viewing error:', error)
    return NextResponse.json(
      { error: 'Failed to create viewing' },
      { status: 500 }
    )
  }
}
