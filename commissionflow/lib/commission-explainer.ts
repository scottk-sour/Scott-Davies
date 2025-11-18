// @ts-nocheck
// =====================================================
// COMMISSION EXPLAINER
// Phase 1A: Generate human-readable commission breakdowns
// =====================================================

import { createServerClient } from './supabase/client'
import type {
  CommissionCalculation,
  CommissionExplanation,
  CalculationStep,
} from '@/types/commission'
import { penceToPounds, formatCurrency } from '@/types'

export class CommissionExplainer {
  /**
   * Generate a complete human-readable explanation of a commission calculation
   *
   * @param calculationId - ID of the commission calculation
   * @returns Formatted explanation with steps
   */
  async generateExplanation(
    calculationId: string
  ): Promise<CommissionExplanation> {
    const supabase = createServerClient()

    // 1. Get the calculation
    const { data: calculation, error } = await supabase
      .from('commission_calculations')
      .select(`
        *,
        user:users!commission_calculations_user_id_fkey(id, name, email)
      `)
      .eq('id', calculationId)
      .single()

    if (error || !calculation) {
      throw new Error(`Calculation ${calculationId} not found`)
    }

    // 2. Get the breakdown steps
    const steps = calculation.calculation_breakdown as CalculationStep[] || []

    // 3. Enhance steps with additional context
    const enhancedSteps = this.enhanceSteps(steps)

    // 4. Build summary
    const summary = this.buildSummary(calculation.input_data)

    return {
      calculation_id: calculation.id,
      user_id: calculation.user_id,
      user_name: calculation.user?.name || 'Unknown',
      period_start: new Date(calculation.calculation_period_start),
      period_end: new Date(calculation.calculation_period_end),
      final_commission: calculation.total_amount,
      steps: enhancedSteps,
      summary,
    }
  }

  /**
   * Generate a plain text explanation (for emails)
   */
  async generateTextExplanation(calculationId: string): Promise<string> {
    const explanation = await this.generateExplanation(calculationId)

    let text = `Commission Statement - ${this.formatPeriod(explanation.period_start, explanation.period_end)}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `${explanation.user_name}\n\n`
    text += `Final Commission: ${formatCurrency(penceToPounds(explanation.final_commission))}\n\n`

    // Summary
    if (explanation.summary.deals_count) {
      text += `Your Performance:\n`
      text += `├─ Deals closed: ${explanation.summary.deals_count}\n`
      if (explanation.summary.total_sales) {
        text += `├─ Total sales: ${formatCurrency(penceToPounds(explanation.summary.total_sales))}\n`
      }
      if (explanation.summary.total_profit) {
        text += `└─ Total profit: ${formatCurrency(penceToPounds(explanation.summary.total_profit))}\n`
      }
      text += `\n`
    }

    // Step-by-step breakdown
    text += `How This Was Calculated:\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    for (const step of explanation.steps) {
      const icon = this.getStepIcon(step.status)
      text += `${icon} STEP ${step.step}: ${step.rule_name}\n`

      if (step.formula) {
        text += `   Formula: ${step.formula}\n`
      }

      text += `   Result: ${formatCurrency(penceToPounds(step.result))}\n`
      text += `   \n`
      text += `   ${step.explanation}\n`
      text += `\n`
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Final Commission: ${formatCurrency(penceToPounds(explanation.final_commission))}\n`

    return text
  }

  /**
   * Generate HTML explanation (for web display and PDF)
   */
  async generateHtmlExplanation(calculationId: string): Promise<string> {
    const explanation = await this.generateExplanation(calculationId)

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Commission Statement</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #1e40af;
    }
    .header .period {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    .final-amount {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .final-amount .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .final-amount .amount {
      font-size: 36px;
      font-weight: bold;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary h2 {
      margin-top: 0;
      font-size: 18px;
      color: #1f2937;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-item .value {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin-top: 5px;
    }
    .breakdown {
      margin-bottom: 30px;
    }
    .breakdown h2 {
      font-size: 20px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .step {
      border-left: 4px solid #e5e7eb;
      padding: 15px 20px;
      margin-bottom: 20px;
      background: white;
      border-radius: 0 8px 8px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .step.applied {
      border-left-color: #10b981;
    }
    .step.not-applied {
      border-left-color: #ef4444;
      opacity: 0.7;
    }
    .step.skipped {
      border-left-color: #f59e0b;
      opacity: 0.7;
    }
    .step-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .step-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .step-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }
    .step-result {
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
    }
    .step-formula {
      font-family: "Courier New", monospace;
      background: #f9fafb;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      color: #4b5563;
      margin: 10px 0;
    }
    .step-explanation {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Commission Statement</h1>
    <div class="period">${this.formatPeriod(explanation.period_start, explanation.period_end)}</div>
  </div>

  <div class="final-amount">
    <div class="label">Total Commission</div>
    <div class="amount">${formatCurrency(penceToPounds(explanation.final_commission))}</div>
  </div>
`

    // Summary section
    if (explanation.summary.deals_count) {
      html += `
  <div class="summary">
    <h2>Your Performance</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="label">Deals Closed</div>
        <div class="value">${explanation.summary.deals_count}</div>
      </div>
`
      if (explanation.summary.total_sales) {
        html += `
      <div class="summary-item">
        <div class="label">Total Sales</div>
        <div class="value">${formatCurrency(penceToPounds(explanation.summary.total_sales))}</div>
      </div>
`
      }
      if (explanation.summary.total_profit) {
        html += `
      <div class="summary-item">
        <div class="label">Total Profit</div>
        <div class="value">${formatCurrency(penceToPounds(explanation.summary.total_profit))}</div>
      </div>
`
      }
      html += `
    </div>
  </div>
`
    }

    // Breakdown section
    html += `
  <div class="breakdown">
    <h2>How This Was Calculated</h2>
`

    for (const step of explanation.steps) {
      const statusClass = step.status.replace('_', '-')
      const icon = this.getStepIcon(step.status)

      html += `
    <div class="step ${statusClass}">
      <div class="step-header">
        <div class="step-icon">${icon}</div>
        <div class="step-title">STEP ${step.step}: ${step.rule_name}</div>
        <div class="step-result">${formatCurrency(penceToPounds(step.result))}</div>
      </div>
`

      if (step.formula) {
        html += `
      <div class="step-formula">${step.formula}</div>
`
      }

      html += `
      <div class="step-explanation">${step.explanation}</div>
    </div>
`
    }

    html += `
  </div>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
    <p>Questions about your commission? Contact your manager or accounts team.</p>
  </div>
</body>
</html>
`

    return html
  }

  /**
   * Generate PDF explanation (uses HTML and converts to PDF)
   * Note: Requires a PDF generation library (e.g., puppeteer, jsPDF)
   */
  async generatePdfExplanation(calculationId: string): Promise<Buffer> {
    const html = await this.generateHtmlExplanation(calculationId)

    // TODO: Implement PDF generation
    // Option 1: Use Puppeteer (headless Chrome)
    // Option 2: Use jsPDF
    // Option 3: Use a service like PDFShift or DocRaptor

    // For now, just return the HTML as buffer
    // You'll need to implement actual PDF conversion
    return Buffer.from(html, 'utf-8')
  }

  /**
   * Enhance steps with additional context
   */
  private enhanceSteps(steps: CalculationStep[]): CalculationStep[] {
    return steps.map(step => ({
      ...step,
      icon: step.icon || this.getStepIcon(step.status),
    }))
  }

  /**
   * Build summary from input data
   */
  private buildSummary(inputData: any): {
    deals_count?: number
    total_sales?: number
    total_profit?: number
    activities?: Record<string, number>
  } {
    return {
      deals_count: inputData.deals?.length || 0,
      total_sales: inputData.total_sales,
      total_profit: inputData.total_profit,
      activities: inputData.activities,
    }
  }

  /**
   * Get icon for step status
   */
  private getStepIcon(status: string): string {
    switch (status) {
      case 'applied':
        return '✅'
      case 'not_applied':
        return '❌'
      case 'skipped':
        return '⏭️'
      default:
        return '•'
    }
  }

  /**
   * Format period as human-readable string
   */
  private formatPeriod(start: Date, end: Date): string {
    const startStr = start.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    })
    const endStr = end.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    })

    if (startStr === endStr) {
      return startStr
    }

    return `${startStr} - ${endStr}`
  }
}

// Export singleton instance
export const commissionExplainer = new CommissionExplainer()
