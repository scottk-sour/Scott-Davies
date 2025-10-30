'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { calculateProductProfit, formatCurrency, formatPercentage } from '@/lib/profit-calculator';
import { DollarSign, TrendingUp, AlertCircle, Package, Truck } from 'lucide-react';

export function ProfitCalculator() {
  const [price, setPrice] = useState<number>(25);
  const [cost, setCost] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [shipping, setShipping] = useState<number>(5);

  const calculation = calculateProductProfit(price, cost, quantity, shipping);

  const isNegativeProfit = calculation.profit.net < 0;
  const isLowMargin = calculation.profit.margin < 20 && calculation.profit.margin >= 0;

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4 md:pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl">Profit Calculator</CardTitle>
            <CardDescription className="text-sm md:text-base mt-1">
              Calculate your net profit after all Etsy fees
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-semibold">
              Item Price
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="pl-9 h-12 text-lg border-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="cost" className="text-sm font-semibold">
              Cost Per Unit
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="pl-9 h-12 text-lg border-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="h-12 text-lg border-2"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="shipping" className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Cost
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="shipping"
                type="number"
                step="0.01"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                className="pl-9 h-12 text-lg border-2"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 pt-6 border-t-2">
          {/* Revenue */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span className="text-sm font-semibold text-blue-900">Total Revenue</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculation.revenue)}
            </span>
          </div>

          {/* Costs Breakdown */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product Cost</span>
                <span className="font-medium">-{formatCurrency(calculation.costs.productCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Etsy Listing Fee</span>
                <span className="font-medium">-{formatCurrency(calculation.costs.etsyFees.listingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Etsy Transaction Fee (6.5%)
                </span>
                <span className="font-medium">-{formatCurrency(calculation.costs.etsyFees.transactionFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Payment Processing (3% + £0.25)
                </span>
                <span className="font-medium">-{formatCurrency(calculation.costs.etsyFees.paymentProcessingFee)}</span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="font-medium">-{formatCurrency(calculation.costs.shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold">Total Costs</span>
                <span className="font-semibold">-{formatCurrency(calculation.costs.totalCosts)}</span>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
            <span className="font-semibold text-yellow-900">Gross Profit (before fees)</span>
            <span className="text-xl font-bold text-yellow-700">
              {formatCurrency(calculation.profit.gross)}
            </span>
          </div>

          {/* Net Profit - Hero Section */}
          <div className={`p-4 md:p-6 rounded-xl shadow-lg ${
            isNegativeProfit
              ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'
              : 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${
                  isNegativeProfit ? 'bg-red-200' : 'bg-green-200'
                } flex items-center justify-center`}>
                  <TrendingUp className={`h-5 w-5 md:h-6 md:w-6 ${
                    isNegativeProfit ? 'text-red-700' : 'text-green-700'
                  }`} />
                </div>
                <span className="text-lg md:text-xl font-bold">Net Profit</span>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className={`text-3xl md:text-4xl font-bold ${
                  isNegativeProfit ? 'text-red-700' : 'text-green-700'
                }`}>
                  {formatCurrency(calculation.profit.net)}
                </p>
                <Badge
                  variant={isNegativeProfit ? 'destructive' : isLowMargin ? 'secondary' : 'default'}
                  className="mt-2 text-sm px-3 py-1"
                >
                  {formatPercentage(calculation.profit.margin)} margin
                </Badge>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {isNegativeProfit && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning: Losing Money!</p>
                <p>
                  You're losing {formatCurrency(Math.abs(calculation.profit.net))} on this sale. Consider increasing your price or reducing costs.
                </p>
              </div>
            </div>
          )}

          {!isNegativeProfit && isLowMargin && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Low Profit Margin</p>
                <p>
                  Your profit margin is below 20%. Consider optimizing your pricing or reducing costs for better profitability.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fee Breakdown Info */}
        <div className="pt-6 border-t">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Etsy Fees (2024):</strong> £0.20 listing fee + 6.5% transaction fee + 3% + £0.25 payment processing.
              Fees are calculated on item price plus shipping cost.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
