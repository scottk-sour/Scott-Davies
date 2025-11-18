# ⚠️ CRITICAL FIX APPLIED - BDM Commission Logic

## 🔴 What Was Wrong

The original commission calculation used an **ACCUMULATION MODEL** (incorrect):
- BDM profit "saved up" until hitting £3,500
- Then BDM got paid everything saved
- This was WRONG for deficit-based thresholds

## ✅ What's Fixed Now

The system now uses a **DEFICIT MODEL** (correct):
- BDM must hit £3,500 EACH MONTH
- If they're short, the deficit carries forward
- Next month they owe: £3,500 + previous deficit
- They only get paid on EXCESS over the cumulative threshold
- Commission rate is CONFIGURABLE per organization

---

## 📊 How It Works Now (Examples)

### Example 1: Building Up Deficit

**October:**
- Base threshold: £3,500
- BDM makes: £2,000
- Deficit: £3,500 - £2,000 = **£1,500**
- Commission paid: **£0**
- Carry forward: **-£1,500 deficit**

**November:**
- Base threshold: £3,500
- Previous deficit: £1,500
- **Threshold needed: £3,500 + £1,500 = £5,000**
- BDM makes: £4,000
- Still short: £5,000 - £4,000 = **£1,000**
- Commission paid: **£0**
- Carry forward: **-£1,000 deficit**

**December:**
- Base threshold: £3,500
- Previous deficit: £1,000
- **Threshold needed: £3,500 + £1,000 = £4,500**
- BDM makes: £5,500
- **EXCEEDED!** Excess: £5,500 - £4,500 = **£1,000**
- Commission rate: 100% (default, configurable)
- Commission paid: **£1,000** ✅
- Carry forward: **£0** (debt cleared!)

---

### Example 2: With Configurable Commission Rate

**Settings:**
- Base threshold: £3,500
- BDM commission rate: **50%** (organization can configure this!)

**Month 1:**
- Threshold needed: £3,500 (no previous deficit)
- BDM makes: £6,000
- Excess: £6,000 - £3,500 = £2,500
- Commission rate: 50%
- Commission paid: **£2,500 × 50% = £1,250** ✅

---

## 🔧 What Changed in the Code

### 1. Database Schema (`supabase/schema.sql`)

**Added to `organizations` table:**
```sql
bdm_threshold_amount INTEGER DEFAULT 350000  -- £3,500 in pence (configurable!)
bdm_commission_rate DECIMAL(5, 4) DEFAULT 1.0000  -- 100% (can be 0.10 for 10%, etc.)
```

**Updated `commission_records` table:**
```sql
-- OLD (WRONG):
previous_carryover INTEGER  -- Was accumulation
cumulative_amount INTEGER   -- Was total saved up
threshold_amount INTEGER    -- Was fixed
carryover_to_next INTEGER   -- Was accumulation

-- NEW (CORRECT):
previous_deficit INTEGER DEFAULT 0  -- Deficit owed (positive = debt)
threshold_needed INTEGER  -- Total needed (base + deficit)
base_threshold INTEGER  -- Organization's base threshold
excess_over_threshold INTEGER  -- Amount over threshold (if met)
deficit_to_next INTEGER DEFAULT 0  -- Deficit carrying forward
```

---

### 2. Commission Calculator (`lib/commission-calculator.ts`)

**OLD Logic (WRONG):**
```typescript
const cumulativeAmount = monthlyProfit + previousCarryover
if (cumulativeAmount >= threshold) {
  commission = cumulativeAmount  // Pay everything saved
}
```

**NEW Logic (CORRECT):**
```typescript
// Get organization settings (configurable!)
const baseThreshold = org.bdm_threshold_amount || 350000
const commissionRate = org.bdm_commission_rate || 1.0

// Calculate what they need to hit
const thresholdNeeded = baseThreshold + previousDeficit

if (monthlyProfit >= thresholdNeeded) {
  // They exceeded! Calculate excess
  const excess = monthlyProfit - thresholdNeeded
  commission = excess × commissionRate  // Pay % of excess
  deficitToNext = 0  // Debt cleared
} else {
  // Still short
  commission = 0
  deficitToNext = thresholdNeeded - monthlyProfit  // Debt increases
}
```

---

### 3. Database Types (`types/database.ts`)

Updated all TypeScript types to match new schema fields.

---

## 🎛️ Configurable Settings (Per Organization)

Each organization can now configure:

1. **BDM Threshold Amount** (default: £3,500)
   - Can be changed to £2,000, £5,000, whatever
   - Stored in pence (350000 = £3,500)

2. **BDM Commission Rate** (default: 100%)
   - Can be 10% (0.10), 50% (0.50), 100% (1.0)
   - Applied to excess over threshold

**Example configurations:**
- Conservative: £5,000 threshold, 50% commission rate
- Aggressive: £2,000 threshold, 100% commission rate
- Hybrid: £3,500 threshold, 75% commission rate

---

## ⚙️ How to Configure (When Settings Page is Built)

**For now, configure directly in Supabase:**

```sql
-- Update organization settings
UPDATE organizations
SET
  bdm_threshold_amount = 500000,  -- £5,000
  bdm_commission_rate = 0.50      -- 50%
WHERE id = 'your-organization-id';
```

**After settings page is built:**
- Go to Settings > Commission
- Set "BDM Monthly Threshold": £3,500
- Set "BDM Commission Rate": 100%
- Save

---

## 📈 Real-World Scenarios

### Scenario 1: Bad Month → Good Month

**Company:** Solar installation company
**Settings:** £3,500 threshold, 100% rate

**August (Slow month):**
- Made: £1,500
- Deficit: £2,000
- Paid: £0

**September (Great month!):**
- Need: £3,500 + £2,000 = £5,500
- Made: £8,000
- Excess: £2,500
- **Paid: £2,500** 🎉

**October (Normal month):**
- Need: £3,500 (no deficit)
- Made: £4,000
- Excess: £500
- **Paid: £500**

---

### Scenario 2: Multiple Bad Months

**November:**
- Need: £3,500
- Made: £2,000
- Deficit: £1,500

**December:**
- Need: £5,000
- Made: £2,500
- Deficit: £2,500 (cumulative)

**January:**
- Need: £6,000
- Made: £3,000
- Deficit: £3,000 (cumulative)

**February (Finally!):**
- Need: £6,500
- Made: £10,000
- Excess: £3,500
- **Paid: £3,500** 🎉

---

## 🚨 Important Notes

### 1. Values Stored in Pence
- £3,500 = 350000 in database
- £100 = 10000 in database
- Always use `penceToPounds()` for display
- Always use `poundsToPence()` when saving

### 2. Deficit Can Accumulate
- BDMs can go months without pay if they keep missing threshold
- This is BY DESIGN (correct behavior)
- Deficit clears as soon as they exceed

### 3. Commission Rate Flexibility
- Some companies pay 100% of excess
- Some companies pay 50% of excess
- Some companies pay 10% of excess
- **This is now configurable!**

---

## ✅ What Still Needs to Be Done

1. **Settings Page** - UI to configure threshold & rate (pending)
2. **Reports Page Update** - Show "deficit" instead of "carryover" (pending)
3. **Documentation Update** - Update all docs with correct examples (pending)

---

## 🎯 Testing the Fix

### Test Case 1: Deficit Accumulation
```
Month 1: Make £2,000, need £3,500 → Deficit £1,500
Month 2: Make £2,500, need £5,000 → Deficit £2,500 cumulative
Month 3: Make £7,000, need £6,000 → Excess £1,000 → Get paid £1,000
```

### Test Case 2: Custom Rate
```
Settings: £3,500 threshold, 50% rate
Month 1: Make £5,000, need £3,500 → Excess £1,500 → Get paid £750 (50%)
```

### Test Case 3: Changing Threshold
```
Settings: Change to £2,000 threshold
Month 1: Make £3,000, need £2,000 → Excess £1,000 → Get paid £1,000
```

---

## 📝 Summary

**Before:** Accumulation model (saving up) - WRONG ❌
**After:** Deficit model (paying off debt) - CORRECT ✅

**Before:** Fixed threshold and 100% payout
**After:** Configurable threshold AND rate ✅

**Impact:** System now matches how UK sales companies actually pay BDM commissions!

---

**Date Fixed:** 2025-01-XX
**Files Changed:**
- `supabase/schema.sql`
- `lib/commission-calculator.ts`
- `types/database.ts`

**Next Steps:**
- Build settings page
- Update reports UI
- Update documentation
