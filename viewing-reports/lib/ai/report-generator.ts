import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ViewingData {
  property: {
    address: string
    postcode: string
  }
  viewing: {
    date: Date
    viewerName: string
    viewerPhone?: string
    viewerEmail?: string
    interestLevel: number
    financialPosition: number
    seriousness: number
    notes?: string
    feedbackPositive?: string
    feedbackNegative?: string
  }
  agent: {
    name: string
  }
  agency?: {
    name: string
    phone?: string
  }
}

function buildReportPrompt(data: ViewingData): string {
  const interestText: Record<number, string> = {
    5: 'extremely keen and asked detailed questions',
    4: 'very interested with positive feedback',
    3: 'moderately interested',
    2: 'lukewarm response',
    1: 'little interest shown',
  }

  const financialText: Record<number, string> = {
    5: 'cash buyer, ready to proceed immediately',
    4: 'mortgage approved, chain-free',
    3: 'mortgage in progress',
    2: 'early stages of mortgage application',
    1: 'financial position unclear',
  }

  const seriousnessText: Record<number, string> = {
    5: 'very serious, viewing multiple properties actively',
    4: 'serious buyer with clear timeline',
    3: 'moderately serious, exploring options',
    2: 'casually looking, no urgency',
    1: 'just browsing',
  }

  return `You are a professional UK estate agent with 15 years of experience writing property viewing reports for vendors.

Create a formal viewing report based on this information:

PROPERTY: ${data.property.address}, ${data.property.postcode}
VIEWING DATE: ${format(data.viewing.date, 'EEEE do MMMM yyyy')} at ${format(data.viewing.date, 'HH:mm')}

VIEWER DETAILS:
Name: ${data.viewing.viewerName}
${data.viewing.viewerPhone ? `Phone: ${data.viewing.viewerPhone}` : ''}
${data.viewing.viewerEmail ? `Email: ${data.viewing.viewerEmail}` : ''}

VIEWING ASSESSMENT:
Interest Level: ${data.viewing.interestLevel}/5 - The viewer was ${interestText[data.viewing.interestLevel]}.
Financial Position: ${data.viewing.financialPosition}/5 - ${financialText[data.viewing.financialPosition]}.
Seriousness: ${data.viewing.seriousness}/5 - ${seriousnessText[data.viewing.seriousness]}.

${data.viewing.notes ? `AGENT'S NOTES:\n${data.viewing.notes}\n` : ''}

${data.viewing.feedbackPositive ? `POSITIVE FEEDBACK:\n${data.viewing.feedbackPositive}\n` : ''}

${data.viewing.feedbackNegative ? `CONCERNS RAISED:\n${data.viewing.feedbackNegative}\n` : ''}

Create a professional viewing report for the vendor that:
1. Provides a concise executive summary (2-3 sentences)
2. Describes the viewer's profile and readiness
3. Summarizes their feedback professionally
4. Highlights positive reactions
5. Diplomatically mentions any concerns (without being overly negative)
6. Provides a clear, actionable recommendation
7. Suggests specific next steps

CRITICAL REQUIREMENTS:
- Be honest but constructive
- Never fabricate information
- Use professional UK estate agent language
- Keep it concise (~300-400 words)
- This goes directly to the vendor
- Format in clean markdown with clear sections

OUTPUT FORMAT:
# Property Viewing Report

## Summary
[2-3 sentence executive summary]

## Viewer Profile
[Financial position and readiness]

## Viewing Feedback
[Summary of their reactions]

### What They Liked
[Positive feedback points]

${data.viewing.feedbackNegative ? '### Concerns Raised\n[Any concerns mentioned]' : ''}

## Recommendation
[Clear recommendation based on the viewing]

## Next Steps
[Specific actionable next steps]

---
Prepared by: ${data.agent.name}${data.agency ? ` | ${data.agency.name}` : ''}
${data.agency?.phone ? `Contact: ${data.agency.phone}` : ''}`
}

export async function generateViewingReport(
  data: ViewingData
): Promise<string> {
  const prompt = buildReportPrompt(data)

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic')
  }

  return content.text
}
