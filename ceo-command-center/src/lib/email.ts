import { Resend } from 'resend'

// Lazy initialize Resend to avoid build-time errors
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

type SendEmailOptions = {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const resend = getResendClient();
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
