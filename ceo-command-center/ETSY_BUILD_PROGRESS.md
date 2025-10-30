# Etsy Organizer Build Progress

Building the REAL Etsy integration with inventory tracking, order management, and profit calculator.

## ✅ Completed (50% Done)

### 1. Database Schema ✅
**File:** `prisma/schema.prisma`
- Replaced CEO Command Center schema with Etsy models
- Added: EtsyShop, Product, Order, OrderItem, StockAlert
- Removed: Task, Project, Goal, Habit, HabitLog, EnergyLog, WeeklyReview, Meeting
- User model simplified for Etsy focus

**Next Step:** Run `npx prisma migrate reset` and `npx prisma db push` (instructions in MIGRATE_TO_ETSY.md)

### 2. Etsy OAuth Integration ✅
**File:** `src/lib/etsy.ts`
- OAuth URL generation
- Token exchange after authorization
- Automatic token refresh when expired
- API client for all Etsy v3 endpoints
- Rate limiting handling

**API Routes Created:**
- `POST /api/etsy/connect` - Generate OAuth URL
- `GET /api/etsy/callback` - Save shop connection after OAuth
- `POST /api/etsy/sync` - Sync products and orders from Etsy

**Features:**
- Connects Etsy shop via OAuth
- Saves access/refresh tokens securely
- Auto-syncs listings (products) from Etsy
- Auto-syncs receipts (orders) with line items
- Creates stock alerts for low inventory

### 3. Products Page ✅
**File:** `src/app/(dashboard)/products/page.tsx`

**Features:**
- Display all products from Etsy with images
- Color-coded stock badges (green/yellow/red)
- Search products by title
- Filter by: All, Low Stock, Out of Stock
- Edit cost per unit (for profit calculation)
- Shows: price, cost, profit, views, favorites
- Stats cards: Total Products, Low Stock, Out of Stock, Total Value
- "Sync from Etsy" button for manual sync

**API Routes Created:**
- `GET /api/products` - Fetch all products
- `GET /api/products/[id]` - Get single product with order history
- `PATCH /api/products/[id]` - Update cost per unit and stock threshold

---

## 🚧 Still To Build (50% Remaining)

### 4. Orders Page ⏳
**To Create:** `src/app/(dashboard)/orders/page.tsx`

**Features Needed:**
- List all orders from Etsy
- Filter by status: Pending, Shipped, Delivered, Canceled
- Search by order number or customer name
- Order details modal with line items
- Mark order as shipped
- Add tracking number
- Show profit per order (if cost data available)
- Stats: Total Orders, Revenue, Pending Orders, Average Order Value

**API Routes Needed:**
- `GET /api/orders` - Fetch all orders
- `GET /api/orders/[id]` - Get order details with items
- `PATCH /api/orders/[id]` - Update order status/tracking

### 5. Dashboard Updates ⏳
**File to Modify:** `src/app/(dashboard)/dashboard/page.tsx`

**Replace Current Stats With:**
- Total Products
- Low Stock Alerts
- Orders This Week
- Revenue This Month
- Recent low stock products widget
- Recent orders widget
- Quick sync button

### 6. Sidebar Navigation Update ⏳
**File to Modify:** `src/components/layout/Sidebar.tsx`

**Change Navigation From:**
- Dashboard
- Tasks
- Projects
- Goals
- Habits
- Energy
- Weekly Review
- Meetings

**Change Navigation To:**
- Dashboard
- Products (inventory)
- Orders (order management)
- Analytics (coming soon)
- Settings

### 7. Stock Alert Email System ⏳
**Files to Create:**
- `src/emails/StockAlert.tsx` - Email template for low stock alerts
- `src/app/api/email/stock-alerts/route.ts` - Cron job endpoint

**Features:**
- Email when product stock drops below threshold
- Email when product goes out of stock
- Email when product back in stock
- User can acknowledge/dismiss alerts
- Dashboard widget showing active alerts

### 8. Profit Calculator Component ⏳
**File to Create:** `src/components/analytics/ProfitCalculator.tsx`

**Features:**
- Calculate profit per product (Price - Cost - Etsy Fees)
- Calculate profit per order
- Show total profit for date range
- Etsy fee calculator (~6.5% + $0.20 per listing)
- Shipping cost consideration
- Gross vs Net profit

### 9. Remove CEO Features ⏳
**Files/Folders to Delete:**
- `src/app/(dashboard)/tasks/`
- `src/app/(dashboard)/projects/`
- `src/app/(dashboard)/goals/`
- `src/app/(dashboard)/habits/`
- `src/app/(dashboard)/energy/`
- `src/app/(dashboard)/review/`
- `src/app/(dashboard)/meetings/`
- `src/app/api/tasks/`
- `src/app/api/projects/`
- `src/app/api/goals/`
- `src/app/api/habits/`

### 10. Environment Variables to Add ⏳
**In Vercel Settings → Environment Variables:**

```
ETSY_API_KEY=your_etsy_keystring
ETSY_CLIENT_SECRET=your_etsy_shared_secret
NEXT_PUBLIC_URL=https://etsy-organizer.vercel.app
```

Get these from: https://www.etsy.com/developers/your-apps (once API approved)

---

## 🎯 Next Steps (Priority Order)

1. **Orders Page** - Complete order management functionality
2. **Dashboard Updates** - Show Etsy shop stats instead of CEO stats
3. **Sidebar Navigation** - Update menu to Etsy pages
4. **Remove CEO Features** - Delete unused task/project/goal pages
5. **Stock Alert Emails** - Set up email notifications for low stock
6. **Profit Calculator** - Build comprehensive profit analysis tool

---

## 📝 Testing Plan (Once Etsy API Approved)

1. **OAuth Flow:**
   - Click "Connect Etsy Shop" button
   - Authorize on Etsy
   - Verify shop appears in database
   - Check tokens are saved

2. **Product Sync:**
   - Click "Sync from Etsy"
   - Verify products appear
   - Check images, prices, stock levels
   - Add cost per unit
   - Verify profit calculation

3. **Order Sync:**
   - Trigger sync
   - Verify orders appear
   - Check order items linked to products
   - Verify profit per order

4. **Stock Alerts:**
   - Set product stock to 3
   - Run sync
   - Check alert created in database
   - Verify email sent

---

## 🚀 Ready to Continue?

The foundation is built! Once you're ready to continue:

1. I'll build the Orders page next
2. Then update the Dashboard
3. Then update Sidebar navigation
4. Then remove old CEO features
5. Then add stock alert emails

**Want me to continue building? Just say "continue building Etsy features"!**

---

**Current Branch:** `claude/placeholder-feature-011CUY1wnMbUvbmFRomEy3jF`
**Last Updated:** 2025-10-30
**Commits Made:** 5 new commits with Etsy integration
