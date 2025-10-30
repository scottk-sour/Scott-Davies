import { ProfitCalculator } from '@/components/analytics/ProfitCalculator';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border-none shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate profit and analyze your Etsy shop performance
        </p>
      </div>

      {/* Profit Calculator - Full Width */}
      <div className="max-w-4xl mx-auto">
        <ProfitCalculator />
      </div>

      {/* Future: Add more analytics widgets here */}
      {/* - Best selling products */}
      {/* - Revenue trends chart */}
      {/* - Profit trends chart */}
      {/* - Top customers */}
    </div>
  );
}
