import { ProfitCalculator } from '@/components/analytics/ProfitCalculator';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Calculate profit and analyze your Etsy shop performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Calculator */}
        <ProfitCalculator />

        {/* Future: Add more analytics widgets here */}
        {/* - Best selling products */}
        {/* - Revenue trends chart */}
        {/* - Profit trends chart */}
        {/* - Top customers */}
      </div>
    </div>
  );
}
