'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { calculateProductProfit, formatCurrency, formatPercentage } from '@/lib/profit-calculator';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export function ProfitCalculator() {
  const [price, setPrice] = useState<number>(25);
  const [cost, setCost] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [shipping, setShipping] = useState<number>(5);

  const calculation = calculateProductProfit(price, cost, quantity, shipping);

  const isNegativeProfit = calculation.profit.net < 0;
  const isLowMargin = calculation.profit.margin < 20 && calculation.profit.margin >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Calculator</CardTitle>
        <CardDescription>
          Calculate your profit after Etsy fees and costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Item Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost Per Unit</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping">Shipping Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="shipping"
                type="number"
                step="0.01"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t">
          {/* Revenue */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Revenue</span>
            <span className="text-lg font-bold">
              {formatCurrency(calculation.revenue)}
            </span>
          </div>

          {/* Costs Breakdown */}
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Product Cost</span>
              <span>-{formatCurrency(calculation.costs.productCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Etsy Listing Fee</span>
              <span>-{formatCurrency(calculation.costs.etsyFees.listingFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Etsy Transaction Fee (6.5%)
              </span>
              <span>-{formatCurrency(calculation.costs.etsyFees.transactionFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Payment Processing (3% + $0.25)
              </span>
              <span>-{formatCurrency(calculation.costs.etsyFees.paymentProcessingFee)}</span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Cost</span>
                <span>-{formatCurrency(calculation.costs.shippingCost)}</span>
              </div>
            )}
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Gross Profit (before fees)</span>
            <span className="font-semibold">
              {formatCurrency(calculation.profit.gross)}
            </span>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-5 w-5 ${isNegativeProfit ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-lg font-bold">Net Profit</span>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${isNegativeProfit ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(calculation.profit.net)}
              </p>
              <Badge
                variant={isNegativeProfit ? 'destructive' : isLowMargin ? 'secondary' : 'default'}
                className="mt-1"
              >
                {formatPercentage(calculation.profit.margin)} margin
              </Badge>
            </div>
          </div>

          {/* Warnings */}
          {isNegativeProfit && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> You're losing money on this sale. Consider increasing your price or reducing costs.
              </p>
            </div>
          )}

          {!isNegativeProfit && isLowMargin && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Low margin:</strong> Your profit margin is below 20%. Consider optimizing your pricing or costs.
              </p>
            </div>
          )}
        </div>

        {/* Fee Breakdown Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Etsy Fees (2024):</strong> $0.20 listing fee + 6.5% transaction fee + 3% + $0.25 payment processing.
            Fees are calculated on item price plus shipping.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
