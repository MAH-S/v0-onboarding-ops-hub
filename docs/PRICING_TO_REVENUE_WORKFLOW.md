# Pricing to Revenue Tracker Workflow - Technical Design Document

## 1. Overview

This document describes the automated workflow that transfers projects from the **Project Calculator** (pricing module) to the **Revenue Tracker** when pricing is marked as complete.

### Workflow Summary

```
┌─────────────────────┐     Status Change     ┌─────────────────────┐
│  Project Calculator │ ──────────────────────▶ │   Revenue Tracker   │
│  (Pricing Module)   │  "Pricing Complete"   │  (Revenue Module)   │
└─────────────────────┘                        └─────────────────────┘
         │                                              │
         │ • Total Price                               │ • Payment Type Selection
         │ • Project Dates                             │ • Invoice Scheduling
         │ • Currency                                  │ • Revenue Recognition
         └──────────────────────────────────────────────┘
                        Auto-Sync on Changes
```

---

## 2. Pricing Status Lifecycle

### 2.1 Status Values

| Status | Description | Can Transfer? |
|--------|-------------|---------------|
| `not-priced` | No pricing data entered | No |
| `in-progress` | Pricing partially completed | No |
| `pricing-complete` | All pricing finalized, ready for revenue | **Yes** |

### 2.2 Status Transitions

```
┌─────────────┐     Add Tasks/      ┌─────────────┐     Mark Complete    ┌──────────────────┐
│ not-priced  │ ──────────────────▶ │ in-progress │ ──────────────────▶ │ pricing-complete │
└─────────────┘     Assignees       └─────────────┘                      └──────────────────┘
                                           │                                      │
                                           │◀─────────────────────────────────────┘
                                           │         Reopen for Changes
```

---

## 3. Data Flow

### 3.1 Data Transferred from Pricing to Revenue

| Field | Source | Description |
|-------|--------|-------------|
| `projectId` | ProjectPricing.projectId | Link to project |
| `totalPrice` | Calculated from pricing | Sum of all task pricing + expenses |
| `currency` | ProjectPricing.currency | USD, SAR, AED |
| `startDate` | Project.dueDate or first milestone | Project start date |
| `endDate` | Last milestone dueDate | Project end date |
| `pricingSnapshot` | Calculated totals | Breakdown for reference |

### 3.2 Revenue Tracker Entry Structure

```typescript
interface RevenueEntry {
  id: string
  projectId: string
  
  // From Pricing (auto-synced)
  totalPrice: number
  currency: Currency
  pricingUpdatedAt: string
  
  // User-configurable in Revenue Tracker
  paymentType: 'one-time' | 'monthly' | 'milestone'
  paymentSchedule: PaymentScheduleItem[]
  
  // Tracking
  totalInvoiced: number
  totalPaid: number
  status: 'pending' | 'active' | 'completed' | 'overdue'
  
  createdAt: string
  updatedAt: string
}

interface PaymentScheduleItem {
  id: string
  type: 'one-time' | 'monthly' | 'milestone'
  description: string
  amount: number
  dueDate: string
  status: 'pending' | 'invoiced' | 'paid' | 'overdue'
  invoiceNumber?: string
  paidDate?: string
  milestoneId?: string // For milestone-based payments
}
```

---

## 4. Payment Type Options

### 4.1 One-Time Payment

```typescript
// Single payment for full project amount
paymentSchedule: [
  {
    id: 'pay-1',
    type: 'one-time',
    description: 'Full Project Payment',
    amount: totalPrice, // 100% of price
    dueDate: '2026-02-15',
    status: 'pending'
  }
]
```

### 4.2 Monthly Payments

```typescript
// Split into monthly installments
// User selects: number of months OR amount per month
paymentSchedule: [
  {
    id: 'pay-1',
    type: 'monthly',
    description: 'Month 1 - January 2026',
    amount: totalPrice / 3, // e.g., split into 3 months
    dueDate: '2026-01-31',
    status: 'paid'
  },
  {
    id: 'pay-2',
    type: 'monthly',
    description: 'Month 2 - February 2026',
    amount: totalPrice / 3,
    dueDate: '2026-02-28',
    status: 'invoiced'
  },
  {
    id: 'pay-3',
    type: 'monthly',
    description: 'Month 3 - March 2026',
    amount: totalPrice / 3,
    dueDate: '2026-03-31',
    status: 'pending'
  }
]
```

### 4.3 Milestone-Based Payments

```typescript
// Payment tied to project milestones
// Amount distributed based on milestone complexity or user-defined %
paymentSchedule: [
  {
    id: 'pay-1',
    type: 'milestone',
    description: 'Phase 1 - Discovery',
    milestoneId: 'm1',
    amount: totalPrice * 0.30, // 30%
    dueDate: '2026-01-31',
    status: 'paid'
  },
  {
    id: 'pay-2',
    type: 'milestone',
    description: 'Phase 2 - Implementation',
    milestoneId: 'm2',
    amount: totalPrice * 0.50, // 50%
    dueDate: '2026-02-28',
    status: 'pending'
  },
  {
    id: 'pay-3',
    type: 'milestone',
    description: 'Phase 3 - Go-Live',
    milestoneId: 'm3',
    amount: totalPrice * 0.20, // 20%
    dueDate: '2026-03-31',
    status: 'pending'
  }
]
```

---

## 5. Auto-Sync Mechanism

### 5.1 When Pricing Changes After Transfer

When pricing is updated in the Project Calculator after the project has been transferred to Revenue Tracker:

1. **Detect Change**: Zustand store subscription watches for pricing updates
2. **Compare Totals**: If `newTotalPrice !== currentTotalPrice`
3. **Auto-Update Revenue**: Update the revenue entry with new total
4. **Recalculate Payments**: Proportionally adjust payment schedule amounts
5. **Flag for Review**: Add `priceChanged: true` flag for user attention

### 5.2 Sync Logic

```typescript
// In pricing store - when any pricing data changes
updatePricingStatus: (projectId, status) => {
  // ... update pricing status
  
  // If pricing complete, sync to revenue
  if (status === 'pricing-complete') {
    const pricing = getProjectPricing(projectId)
    const totalPrice = calculateTotalPrice(pricing)
    
    // Create or update revenue entry
    syncToRevenue(projectId, {
      totalPrice,
      currency: pricing.currency,
      pricingUpdatedAt: new Date().toISOString()
    })
  }
}

// Auto-sync when pricing data changes (for already-transferred projects)
onPricingChange: (projectId) => {
  const pricing = getProjectPricing(projectId)
  if (pricing.status === 'pricing-complete') {
    const newTotal = calculateTotalPrice(pricing)
    updateRevenueTotal(projectId, newTotal)
  }
}
```

---

## 6. UI Flow

### 6.1 Project Calculator - Mark Pricing Complete

```
┌────────────────────────────────────────────────────────────────┐
│  Project Calculator - Acme Corp Onboarding                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Total Project Price: $150,000 USD                            │
│                                                                │
│  Status: [In Progress ▼]  ───▶  [Pricing Complete ▼]          │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Marking as "Pricing Complete" will:                  │   │
│  │   • Transfer this project to Revenue Tracker            │   │
│  │   • Enable payment scheduling                           │   │
│  │   • Auto-sync any future pricing changes                │   │
│  │                                                         │   │
│  │   [Cancel]  [Confirm & Transfer to Revenue]             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Revenue Tracker - Payment Configuration

```
┌────────────────────────────────────────────────────────────────┐
│  Revenue Tracker - Acme Corp Onboarding                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Contract Value: $150,000 USD  (synced from pricing)          │
│  Last Pricing Update: Jan 26, 2026                            │
│                                                                │
│  Payment Type:                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ ○ One-Time  │ │ ○ Monthly   │ │ ● Milestone │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                │
│  Payment Schedule:                                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Phase          │ Amount    │ Due Date   │ Status       │   │
│  ├────────────────┼───────────┼────────────┼──────────────┤   │
│  │ Discovery      │ $45,000   │ Jan 31     │ ✓ Paid       │   │
│  │ Implementation │ $75,000   │ Feb 28     │ ◐ Invoiced   │   │
│  │ Go-Live        │ $30,000   │ Mar 31     │ ○ Pending    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Progress: [$45,000 paid] ───────────── [$105,000 remaining]  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. State Management Updates

### 7.1 Pricing Store Updates

```typescript
// lib/pricing-store.ts additions

interface PricingStore {
  // ... existing
  
  // New: Mark pricing complete and trigger transfer
  markPricingComplete: (projectId: string) => void
  
  // New: Reopen pricing for changes
  reopenPricing: (projectId: string) => void
  
  // New: Calculate total price
  calculateTotalPrice: (projectId: string) => number
}
```

### 7.2 Revenue Store Updates

```typescript
// lib/revenue-store.ts additions

interface RevenueStore {
  // ... existing
  
  // New: Receive from pricing
  createFromPricing: (projectId: string, pricingData: PricingSyncData) => void
  
  // New: Update from pricing changes
  syncPricingUpdate: (projectId: string, newTotal: number) => void
  
  // New: Payment type configuration
  setPaymentType: (projectId: string, type: PaymentType) => void
  generatePaymentSchedule: (projectId: string, config: PaymentConfig) => void
  
  // New: Payment tracking
  markPaymentInvoiced: (projectId: string, paymentId: string, invoiceNumber: string) => void
  markPaymentPaid: (projectId: string, paymentId: string, paidDate: string) => void
}
```

---

## 8. Visibility Rules

### 8.1 Revenue Tracker Display Rules

| Condition | Show in Revenue Tracker? |
|-----------|-------------------------|
| `pricing.status === 'pricing-complete'` | **Yes** |
| `pricing.status === 'in-progress'` | No |
| `pricing.status === 'not-priced'` | No |
| No pricing record exists | No |

### 8.2 Filter Options

```typescript
// Revenue Tracker filters
const revenueFilters = {
  status: ['all', 'pending', 'active', 'completed', 'overdue'],
  paymentType: ['all', 'one-time', 'monthly', 'milestone'],
  client: [...clientList],
  dateRange: { start: Date, end: Date }
}
```

---

## 9. Implementation Checklist

### Phase 1: Pricing Status Updates
- [ ] Add `pricing-complete` status to ProjectPricing type
- [ ] Add "Mark Pricing Complete" button to Project Calculator
- [ ] Add confirmation dialog with transfer warning
- [ ] Implement `markPricingComplete` action in pricing store

### Phase 2: Revenue Integration
- [ ] Add `createFromPricing` action to revenue store
- [ ] Add `paymentType` and `paymentSchedule` to RevenueEntry
- [ ] Update Revenue Tracker to filter by pricing-complete only
- [ ] Add payment type selector UI

### Phase 3: Payment Configuration
- [ ] Build One-Time payment UI
- [ ] Build Monthly payment configuration (number of months)
- [ ] Build Milestone-based payment configuration
- [ ] Add payment schedule table

### Phase 4: Auto-Sync
- [ ] Implement pricing change detection
- [ ] Auto-update revenue totals on pricing changes
- [ ] Proportional payment schedule recalculation
- [ ] Add "price changed" notification

### Phase 5: Payment Tracking
- [ ] Add invoice marking functionality
- [ ] Add payment received tracking
- [ ] Add overdue payment alerts
- [ ] Build payment history view

---

## 10. API Endpoints (Future Backend)

```typescript
// POST /api/revenue/create-from-pricing
// Creates revenue entry when pricing is marked complete
{
  projectId: string,
  totalPrice: number,
  currency: Currency,
  startDate: string,
  endDate: string
}

// PUT /api/revenue/:projectId/sync-pricing
// Updates revenue total from pricing changes
{
  newTotalPrice: number,
  pricingUpdatedAt: string
}

// PUT /api/revenue/:projectId/payment-type
// Sets payment configuration
{
  paymentType: 'one-time' | 'monthly' | 'milestone',
  config: PaymentConfig
}

// PUT /api/revenue/:projectId/payments/:paymentId/status
// Updates individual payment status
{
  status: 'invoiced' | 'paid',
  invoiceNumber?: string,
  paidDate?: string
}
```

---

## 11. Rollback & Error Handling

### 11.1 If Transfer Fails
- Show error toast with reason
- Keep pricing status as `in-progress`
- Log error for debugging

### 11.2 If Sync Fails
- Queue sync for retry
- Show warning badge on project
- Allow manual sync trigger

### 11.3 Reopen Pricing
- User can reopen pricing for changes
- Revenue entry remains but marked "pricing under review"
- Payment scheduling disabled until re-confirmed
