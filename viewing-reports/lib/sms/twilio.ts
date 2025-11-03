import twilio from 'twilio'
import { formatPhoneNumber } from '../utils'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendVendorNotification(
  vendorPhone: string,
  vendorName: string,
  propertyAddress: string,
  reportUrl: string
): Promise<boolean> {
  try {
    const formattedPhone = formatPhoneNumber(vendorPhone)

    const message = await client.messages.create({
      body: `Hi ${vendorName}, your viewing report for ${propertyAddress} is ready. View it here: ${reportUrl}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    return message.status === 'sent' || message.status === 'queued'
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}

export async function sendViewingReminder(
  agentPhone: string,
  agentName: string,
  propertyAddress: string,
  viewingTime: Date
): Promise<boolean> {
  try {
    const formattedPhone = formatPhoneNumber(agentPhone)

    const message = await client.messages.create({
      body: `Reminder ${agentName}: Viewing at ${propertyAddress} scheduled for ${viewingTime.toLocaleString('en-GB')}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    return message.status === 'sent' || message.status === 'queued'
  } catch (error) {
    console.error('Failed to send reminder SMS:', error)
    return false
  }
}
