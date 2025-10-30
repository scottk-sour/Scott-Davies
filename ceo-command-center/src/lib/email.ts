import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will not work.')
}

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

type SendEmailOptions = {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Etsy Organiser <noreply@etsyorganizer.com>',
      to,
      subject,
      react,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in sendEmail:', error)
    throw error
  }
}
