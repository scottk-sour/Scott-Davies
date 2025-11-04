// App-wide constants

export const APP_NAME = 'RoboSelect';
export const APP_DESCRIPTION = 'Find the perfect robot for your business in 2 minutes';

// Quiz constants
export const QUIZ_STEPS = 6;
export const QUIZ_STORAGE_KEY = 'roboselect-quiz-progress';
export const QUIZ_EXPIRY_DAYS = 7;

// Industries
export const INDUSTRIES = [
  { id: 'hotels', name: 'Hotels', icon: 'Hotel' },
  { id: 'restaurants', name: 'Restaurants', icon: 'UtensilsCrossed' },
  { id: 'cafes', name: 'Cafes & Coffee Shops', icon: 'Coffee' },
  { id: 'care-homes', name: 'Care Homes', icon: 'HeartPulse' },
  { id: 'hospitals', name: 'Hospitals', icon: 'Building2' },
  { id: 'warehouses', name: 'Warehouses', icon: 'Warehouse' },
  { id: 'offices', name: 'Offices', icon: 'Briefcase' },
  { id: 'retail', name: 'Retail', icon: 'Store' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal' },
] as const;

// Use cases
export const USE_CASES = [
  { id: 'delivering', name: 'Delivering food/drinks', icon: 'UtensilsCrossed' },
  { id: 'room-service', name: 'Room service', icon: 'BedDouble' },
  { id: 'cleaning', name: 'Floor cleaning', icon: 'Sparkles' },
  { id: 'disinfection', name: 'Disinfection', icon: 'Shield' },
  { id: 'reception', name: 'Reception/greeting', icon: 'Users' },
  { id: 'security', name: 'Security patrol', icon: 'ShieldCheck' },
  { id: 'inventory', name: 'Inventory transport', icon: 'Package' },
  { id: 'marketing', name: 'Marketing/experience', icon: 'Megaphone' },
] as const;

// Venue sizes
export const VENUE_SIZES = [
  { id: 'under-2k', name: 'Under 2,000 sqft', value: 'under-2k' },
  { id: '2-5k', name: '2,000 - 5,000 sqft', value: '2-5k' },
  { id: '5-10k', name: '5,000 - 10,000 sqft', value: '5-10k' },
  { id: '10-20k', name: '10,000 - 20,000 sqft', value: '10-20k' },
  { id: '20k-plus', name: '20,000+ sqft', value: '20k-plus' },
] as const;

// Budget ranges
export const BUDGET_RANGES = [
  { id: 'under-10k', name: 'Under £10,000', value: 'under-10k' },
  { id: '10-25k', name: '£10,000 - £25,000', value: '10-25k' },
  { id: '25-50k', name: '£25,000 - £50,000', value: '25-50k' },
  { id: '50k-plus', name: '£50,000+', value: '50k-plus' },
  { id: 'not-sure', name: 'Not sure yet', value: 'not-sure' },
] as const;

// Timelines
export const TIMELINES = [
  { id: 'urgent', name: 'Urgent (within 1 month)', value: 'urgent' },
  { id: '2-3mo', name: '2-3 months', value: '2-3mo' },
  { id: '3-6mo', name: '3-6 months', value: '3-6mo' },
  { id: 'researching', name: 'Just researching', value: 'researching' },
] as const;

// Payment preferences
export const PAYMENT_PREFERENCES = [
  { id: 'upfront', name: 'Upfront payment', value: 'upfront' },
  { id: 'financing', name: 'Financing preferred', value: 'financing' },
  { id: 'not-sure', name: 'Not sure yet', value: 'not-sure' },
] as const;

// Finance terms
export const FINANCE_TERMS = [
  { id: 'upfront', name: 'Pay Upfront', value: 'upfront', months: 0 },
  { id: '2-year', name: '2 Year Plan', value: '2-year', months: 24 },
  { id: '3-year', name: '3 Year Plan', value: '3-year', months: 36, popular: true },
  { id: '5-year', name: '5 Year Plan', value: '5-year', months: 60 },
] as const;

// Priorities
export const PRIORITIES = [
  { id: 'cost', name: 'Cost savings / ROI', description: 'Minimizing costs and maximizing return' },
  { id: 'labor', name: 'Labor shortage solution', description: 'Addressing staffing challenges' },
  { id: 'experience', name: 'Customer experience', description: 'Improving guest satisfaction' },
  { id: 'marketing', name: 'Marketing / novelty', description: 'Standing out from competitors' },
  { id: 'efficiency', name: 'Operational efficiency', description: 'Streamlining operations' },
] as const;

// Lead statuses
export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'blue' },
  { value: 'CONTACTED', label: 'Contacted', color: 'yellow' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'purple' },
  { value: 'DEMO_SCHEDULED', label: 'Demo Scheduled', color: 'indigo' },
  { value: 'DEMO_COMPLETED', label: 'Demo Completed', color: 'cyan' },
  { value: 'QUOTE_SENT', label: 'Quote Sent', color: 'orange' },
  { value: 'NEGOTIATING', label: 'Negotiating', color: 'amber' },
  { value: 'WON', label: 'Won', color: 'green' },
  { value: 'LOST', label: 'Lost', color: 'red' },
  { value: 'NURTURE', label: 'Nurture', color: 'gray' },
] as const;

// Quote statuses
export const QUOTE_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'SENT', label: 'Sent', color: 'blue' },
  { value: 'VIEWED', label: 'Viewed', color: 'yellow' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
  { value: 'EXPIRED', label: 'Expired', color: 'orange' },
] as const;

// Demo statuses
export const DEMO_STATUSES = [
  { value: 'REQUESTED', label: 'Requested', color: 'blue' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'green' },
  { value: 'COMPLETED', label: 'Completed', color: 'purple' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'NO_SHOW', label: 'No Show', color: 'orange' },
] as const;

// Pricing constants (in pence for precision)
export const PENCE_TO_POUNDS = 100;

// Format price in pence to GBP string
export function formatPrice(priceInPence: number): string {
  const pounds = priceInPence / PENCE_TO_POUNDS;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pounds);
}

// Email addresses
export const ADMIN_EMAIL = process.env.RESEND_FROM_EMAIL || 'quotes@roboselect.co.uk';
export const SUPPORT_EMAIL = 'support@roboselect.co.uk';
