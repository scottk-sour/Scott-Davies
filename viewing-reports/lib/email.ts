import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendViewingReport(
  to: string,
  vendorName: string,
  propertyAddress: string,
  reportContent: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@viewingreports.co.uk',
      to,
      subject: `Viewing Report: ${propertyAddress}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Property Viewing Report</h1>
          <p>Dear ${vendorName},</p>
          <p>Please find below the viewing report for your property at <strong>${propertyAddress}</strong>.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <div style="white-space: pre-wrap; line-height: 1.6;">
            ${reportContent.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This report was generated automatically by ViewingReports.
          </p>
        </div>
      `,
    })

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
