/**
 * Etsy Fee Calculator
 * https://www.etsy.com/legal/fees/
 */

export type EtsyFees = {
  listingFee: number;
  transactionFee: number;
  paymentProcessingFee: number;
  total: number;
};

export type ProfitCalculation = {
  revenue: number;
  costs: {
    productCost: number;
    etsyFees: EtsyFees;
    shippingCost: number;
    totalCosts: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number; // percentage
  };
};

/**
 * Calculate Etsy fees for a sale
 *
 * Etsy Fees (as of 2024):
 * - Listing Fee: £0.20 per listing (paid when listing)
 * - Transaction Fee: 6.5% of sale price (including shipping)
 * - Payment Processing Fee: 3% + £0.25 per order
 */
export function calculateEtsyFees(
  itemPrice: number,
  shippingCost: number = 0,
  quantity: number = 1
): EtsyFees {
  // Listing fee (£0.20 per listing, only paid once regardless of quantity)
  const listingFee = 0.20;

  // Transaction fee (6.5% of item price + shipping)
  const saleAmount = (itemPrice * quantity) + shippingCost;
  const transactionFee = saleAmount * 0.065;

  // Payment processing fee (3% + £0.25)
  const paymentProcessingFee = (saleAmount * 0.03) + 0.25;

  return {
    listingFee,
    transactionFee,
    paymentProcessingFee,
    total: listingFee + transactionFee + paymentProcessingFee,
  };
}

/**
 * Calculate profit for a product sale
 */
export function calculateProductProfit(
  price: number,
  costPerUnit: number,
  quantity: number = 1,
  shippingCost: number = 0
): ProfitCalculation {
  const revenue = (price * quantity) + shippingCost;
  const productCost = costPerUnit * quantity;
  const etsyFees = calculateEtsyFees(price, shippingCost, quantity);

  const totalCosts = productCost + etsyFees.total + shippingCost;
  const grossProfit = revenue - shippingCost - productCost; // Before fees
  const netProfit = revenue - totalCosts; // After all costs and fees

  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    revenue,
    costs: {
      productCost,
      etsyFees,
      shippingCost,
      totalCosts,
    },
    profit: {
      gross: grossProfit,
      net: netProfit,
      margin: profitMargin,
    },
  };
}

/**
 * Calculate profit for an order with multiple items
 */
export function calculateOrderProfit(
  items: Array<{
    price: number;
    costPerUnit: number | null;
    quantity: number;
  }>,
  shippingCost: number = 0
): ProfitCalculation {
  let totalRevenue = shippingCost;
  let totalProductCost = 0;
  let totalPrice = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    totalRevenue += itemTotal;
    totalPrice += itemTotal;
    totalProductCost += (item.costPerUnit || 0) * item.quantity;
  }

  // Calculate fees based on total order
  const etsyFees = calculateEtsyFees(totalPrice, shippingCost, 1);

  const totalCosts = totalProductCost + etsyFees.total + shippingCost;
  const grossProfit = totalRevenue - shippingCost - totalProductCost;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    revenue: totalRevenue,
    costs: {
      productCost: totalProductCost,
      etsyFees,
      shippingCost,
      totalCosts,
    },
    profit: {
      gross: grossProfit,
      net: netProfit,
      margin: profitMargin,
    },
  };
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
