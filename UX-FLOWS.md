# UX Flows - East Africa Accounting Platform

## Design Principles
1. **Mobile-First**: All screens optimized for 375px width minimum
2. **Non-Accountant Language**: "Money In/Out" instead of "Debit/Credit"
3. **Visual Hierarchy**: Key numbers prominent, details collapsible
4. **Progress Indicators**: Clear steps for complex workflows
5. **Offline-First**: Visual indicators for sync status

## Color Palette (Country-Adaptive)

### Kenya
- Primary: #006B3F (Green from flag)
- Secondary: #BC2025 (Red from flag)
- Accent: #000000

### Uganda
- Primary: #FCDC04 (Yellow)
- Secondary: #000000 (Black)
- Accent: #D90000 (Red)

### Tanzania
- Primary: #1EB53A (Green)
- Secondary: #00A3DD (Blue)
- Accent: #FCD116 (Yellow)

### Rwanda
- Primary: #00A1DE (Blue)
- Secondary: #FAD201 (Yellow)
- Accent: #009543 (Green)

### Burundi
- Primary: #CE1126 (Red)
- Secondary: #1EB53A (Green)
- Accent: #FFFFFF (White)

---

## User Flows

### Flow 1: Onboarding (First-Time Setup)

**Goal**: Collect business information and configure country-specific compliance

#### Screens:

**1.1 Welcome Screen**
```
┌─────────────────────────────┐
│  [Logo] EastBooks           │
│                             │
│  Accounting Made Simple     │
│  for East Africa            │
│                             │
│  [Get Started Button]       │
│                             │
│  Already have account?      │
│  [Sign In]                  │
└─────────────────────────────┘
```

**1.2 Country Selection**
```
┌─────────────────────────────┐
│  ← Select Your Country      │
│  Step 1 of 5                │
│                             │
│  ┌───────────────────────┐  │
│  │ 🇰🇪 Kenya            │  │
│  │ TIMS Compliant       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🇺🇬 Uganda           │  │
│  │ EFRIS Compliant      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🇹🇿 Tanzania         │  │
│  │ VFD Compliant        │  │
│  └───────────────────────┘  │
│                             │
│  [+ More Countries]         │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**1.3 Business Information**
```
┌─────────────────────────────┐
│  ← Business Details          │
│  Step 2 of 5                │
│                             │
│  Business Name *            │
│  ┌─────────────────────┐    │
│  │ Juma Electronics    │    │
│  └─────────────────────┘    │
│                             │
│  Tax ID (TIN/VAT) *         │
│  ┌─────────────────────┐    │
│  │ P051234567M         │ ✓  │
│  └─────────────────────┘    │
│  (Auto-validated)           │
│                             │
│  Business Address           │
│  ┌─────────────────────┐    │
│  │ Nairobi, Kenya      │    │
│  └─────────────────────┘    │
│                             │
│  Currency: KES (Kenyan      │
│            Shilling)        │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**1.4 Payment Methods**
```
┌─────────────────────────────┐
│  ← Payment Methods           │
│  Step 3 of 5                │
│                             │
│  How do you get paid?       │
│                             │
│  ☑ M-Pesa                   │
│    ┌─────────────────────┐  │
│    │ Business Till: 12345│  │
│    └─────────────────────┘  │
│                             │
│  ☑ Bank Transfer            │
│    ┌─────────────────────┐  │
│    │ Account: 123456789  │  │
│    │ Bank: Equity Bank   │  │
│    └─────────────────────┘  │
│                             │
│  ☐ Airtel Money             │
│  ☐ Cash Only                │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**1.5 Initial Setup Complete**
```
┌─────────────────────────────┐
│  ✓ All Set!                 │
│                             │
│  Your business is ready     │
│  to start tracking money.   │
│                             │
│  Quick Tips:                │
│  • Add your first sale      │
│  • Track an expense         │
│  • Create an invoice        │
│                             │
│  [Go to Dashboard]          │
└─────────────────────────────┘
```

---

### Flow 2: Dashboard (Home Screen)

**Goal**: Overview of business financial health

```
┌─────────────────────────────────────┐
│  ☰  Dashboard          🔔 [👤 JK]  │
├─────────────────────────────────────┤
│  🇰🇪 Juma Electronics              │
│  Today: Thu, Jan 15, 2026           │
│  ⚡ Synced 2 min ago                │
├─────────────────────────────────────┤
│                                     │
│  This Month (January 2026)          │
│                                     │
│  ┌────────────┐  ┌──────────────┐  │
│  │ Money In   │  │ Money Out    │  │
│  │ KES 45,200 │  │ KES 18,300   │  │
│  │ +12% ↑     │  │ -5% ↓        │  │
│  └────────────┘  └──────────────┘  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Profit This Month           │   │
│  │ KES 26,900                  │   │
│  │ ████████░░░░ 60% margin     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [📊 Chart: 7-day trend]            │
│                                     │
├─────────────────────────────────────┤
│  Quick Actions                      │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ 💰   │ │ 💳   │ │ 📄   │        │
│  │ Sale │ │Expense│Invoice│        │
│  └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────┤
│  Recent Activity                    │
│  ┌───────────────────────────────┐ │
│  │ ⬆️ Sale - Retail               │ │
│  │ KES 2,500                     │ │
│  │ M-Pesa • 10:34 AM             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ⬇️ Expense - Rent              │ │
│  │ KES 15,000                    │ │
│  │ Bank Transfer • Yesterday     │ │
│  └───────────────────────────────┘ │
│                                     │
│  [View All Transactions]            │
│                                     │
├─────────────────────────────────────┤
│  Tax Reminders                      │
│  ⚠️ VAT Return Due: Jan 20          │
│  📊 [View VAT Summary]              │
└─────────────────────────────────────┘

Bottom Nav:
[🏠 Home] [💰 Money] [📄 Invoices] [📊 Reports] [⚙️ More]
```

---

### Flow 3: Record Transaction (Money In/Out)

**Goal**: Quickly record a sale or expense

**3.1 Transaction Type Selection**
```
┌─────────────────────────────┐
│  ← New Transaction          │
│                             │
│  What happened?             │
│                             │
│  ┌─────────────────────┐    │
│  │ 💰 Money In         │    │
│  │ Record a sale       │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 💳 Money Out        │    │
│  │ Record an expense   │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🔄 Transfer         │    │
│  │ Move money around   │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**3.2 Record Sale (Money In)**
```
┌─────────────────────────────┐
│  ← Record Sale              │
│                             │
│  Amount (KES) *             │
│  ┌─────────────────────┐    │
│  │ 2,500              │    │
│  └─────────────────────┘    │
│                             │
│  What did you sell?         │
│  ┌─────────────────────┐    │
│  │ Retail              ▼│   │
│  └─────────────────────┘    │
│  💡 Based on history        │
│                             │
│  How were you paid?         │
│  ┌─────────────────────┐    │
│  │ M-Pesa              ▼│   │
│  └─────────────────────┘    │
│                             │
│  Reference (Optional)       │
│  ┌─────────────────────┐    │
│  │ SAX123456          │    │
│  └─────────────────────┘    │
│                             │
│  Description (Optional)     │
│  ┌─────────────────────┐    │
│  │ Phone sale to John  │    │
│  └─────────────────────┘    │
│                             │
│  ┌───────────────────────┐  │
│  │ VAT (16%): KES 344.83│  │
│  │ Total: KES 2,500.00  │  │
│  └───────────────────────┘  │
│                             │
│  [Save Transaction]         │
└─────────────────────────────┘
```

**3.3 Success Confirmation**
```
┌─────────────────────────────┐
│  ✓ Sale Recorded!           │
│                             │
│  KES 2,500.00               │
│  Retail • M-Pesa            │
│                             │
│  This Month's Sales         │
│  KES 47,700 (+5.5%)         │
│                             │
│  [📄 Create Invoice]        │
│  [🏠 Back to Dashboard]     │
└─────────────────────────────┘
```

---

### Flow 4: Create Invoice

**Goal**: Generate a tax-compliant invoice

**4.1 Customer Selection**
```
┌─────────────────────────────┐
│  ← New Invoice              │
│  Step 1 of 3                │
│                             │
│  Who is this for?           │
│                             │
│  🔍 [Search customers...]   │
│                             │
│  Recent Customers           │
│  ┌───────────────────────┐  │
│  │ Sarah Mwangi          │  │
│  │ +254712345678         │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Tech Solutions Ltd    │  │
│  │ TIN: P051234567M      │  │
│  └───────────────────────┘  │
│                             │
│  [+ Add New Customer]       │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**4.2 Invoice Items**
```
┌─────────────────────────────┐
│  ← Invoice Items            │
│  Step 2 of 3                │
│                             │
│  Customer: Sarah Mwangi     │
│                             │
│  Items                      │
│  ┌───────────────────────┐  │
│  │ Samsung Phone         │  │
│  │ Qty: 1 × KES 25,000  │  │
│  │                 25,000│  │
│  └───────────────────────┘  │
│                             │
│  [+ Add Item]               │
│                             │
│  ────────────────────────   │
│  Subtotal:    KES 25,000.00 │
│  VAT (16%):   KES  4,000.00 │
│  ────────────────────────   │
│  Total:       KES 29,000.00 │
│                             │
│  Due Date                   │
│  ┌─────────────────────┐    │
│  │ Jan 22, 2026  (7d)  ▼│   │
│  └─────────────────────┘    │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**4.3 Review & Submit**
```
┌─────────────────────────────┐
│  ← Review Invoice           │
│  Step 3 of 3                │
│                             │
│  Invoice #INV-2026-001      │
│                             │
│  📄 [Preview PDF]           │
│                             │
│  ✓ VAT Compliant (Kenya)    │
│  ✓ Ready for TIMS           │
│                             │
│  Actions:                   │
│  ☑ Submit to TIMS           │
│  ☑ Send via SMS/Email       │
│  ☐ Save as Draft            │
│                             │
│  Send To:                   │
│  📧 sarah@email.com         │
│  📱 +254712345678           │
│                             │
│  [Create Invoice]           │
└─────────────────────────────┘
```

**4.4 Success with TIMS Confirmation**
```
┌─────────────────────────────┐
│  ✓ Invoice Created!         │
│                             │
│  INV-2026-001               │
│  KES 29,000.00              │
│                             │
│  ✓ Submitted to TIMS        │
│  Reference: TIMS-ABC123     │
│                             │
│  ✓ Sent to Customer         │
│  sarah@email.com            │
│                             │
│  [📄 View Invoice]          │
│  [💰 Record Payment]        │
│  [🏠 Back to Dashboard]     │
└─────────────────────────────┘
```

---

### Flow 5: Reports

**Goal**: View financial reports for tax filing and business decisions

**5.1 Reports Dashboard**
```
┌─────────────────────────────┐
│  ← Reports                  │
│                             │
│  Period: January 2026   [▼] │
│                             │
│  ┌───────────────────────┐  │
│  │ 📊 Profit & Loss      │  │
│  │ See what you earned   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 💰 Cash Flow          │  │
│  │ Track money movement  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🏦 Balance Sheet      │  │
│  │ Assets & liabilities  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 📋 VAT Summary        │  │
│  │ Ready for tax filing  │  │
│  │ ⚠️ Due: Jan 20        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 📈 Sales by Category  │  │
│  │ Understand your sales │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**5.2 VAT Summary (Tax Filing)**
```
┌─────────────────────────────┐
│  ← VAT Summary              │
│  January 2026               │
│                             │
│  ⚠️ Due: Jan 20 (5 days)    │
│                             │
│  Output VAT (Sales)         │
│  KES 7,232.00               │
│  ▼ 45 transactions          │
│                             │
│  Input VAT (Purchases)      │
│  KES 2,928.00               │
│  ▼ 18 transactions          │
│                             │
│  ────────────────────────   │
│  VAT Payable                │
│  KES 4,304.00               │
│  ────────────────────────   │
│                             │
│  [📄 Download Summary PDF]  │
│  [📧 Email to Accountant]   │
│                             │
│  Filing Instructions:       │
│  1. Visit iTax portal       │
│  2. Enter VAT return        │
│  3. Submit before Jan 20    │
│                             │
│  [📱 Set Reminder]          │
└─────────────────────────────┘
```

---

### Flow 6: Compliance Submission (TIMS Example)

**Goal**: Submit invoice to tax authority

```
┌─────────────────────────────┐
│  Submitting to TIMS...      │
│                             │
│  Invoice: INV-2026-001      │
│  Amount: KES 29,000.00      │
│                             │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░ 75%        │
│                             │
│  ✓ Validated invoice        │
│  ✓ Connected to TIMS        │
│  ⏳ Awaiting response...     │
│                             │
└─────────────────────────────┘

After success:

┌─────────────────────────────┐
│  ✓ TIMS Approved            │
│                             │
│  Reference: TIMS-ABC123     │
│  Time: 10:45 AM             │
│                             │
│  Your invoice is now        │
│  officially registered      │
│  with KRA.                  │
│                             │
│  QR Code for verification:  │
│  ┌─────────────────────┐    │
│  │ [QR Code Image]     │    │
│  └─────────────────────┘    │
│                             │
│  [Done]                     │
└─────────────────────────────┘
```

---

## Component Library

### Buttons
- **Primary**: Country-themed color, rounded, shadow
- **Secondary**: Outlined, transparent background
- **Icon**: Floating action button for quick actions

### Cards
- White background, subtle shadow
- Rounded corners (12px)
- Padding: 16px
- Border on hover

### Form Inputs
- Label above input
- Helper text below
- Validation icons (✓ / ✗)
- Country-specific formatting (phone, TIN)

### Typography
- Heading 1: 24px bold (page titles)
- Heading 2: 20px semi-bold (section titles)
- Body: 16px regular
- Caption: 14px light (metadata)
- Numbers: Tabular figures, 18px bold

### Navigation
- Bottom navigation (mobile)
- Sidebar (desktop)
- Breadcrumbs for multi-step flows

### Status Indicators
- Badges: Draft, Paid, Overdue, Synced
- Progress bars: Tax thresholds, sync status
- Alerts: Warning (VAT due), Success (invoice sent), Error (sync failed)

### Charts
- Line chart: 7-day trend
- Bar chart: Category breakdown
- Donut chart: Income vs Expense

---

## Responsive Breakpoints

- **Mobile**: 375px - 767px (Primary design)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+ (Sidebar layout)

## Accessibility

- WCAG AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Minimum touch target: 44x44px

## Offline Mode

### Visual Indicators
```
Online:  ⚡ Synced 2 min ago
Offline: 📱 Working Offline (3 changes pending)
Syncing: ↻ Syncing...
Error:   ⚠️ Sync Failed (Retry?)
```

### Offline Capabilities
- ✓ View all transactions
- ✓ Create transactions
- ✓ Create invoices (draft)
- ✗ Submit to tax authority (requires online)
- ✗ Mobile money payments (requires online)

---

## Figma Design Files Structure

```
/designs
├── 01-onboarding
│   ├── welcome.fig
│   ├── country-selection.fig
│   ├── business-info.fig
│   └── payment-setup.fig
├── 02-dashboard
│   ├── home.fig
│   ├── quick-actions.fig
│   └── recent-activity.fig
├── 03-transactions
│   ├── transaction-list.fig
│   ├── create-sale.fig
│   ├── create-expense.fig
│   └── transaction-detail.fig
├── 04-invoices
│   ├── invoice-list.fig
│   ├── create-invoice.fig
│   ├── invoice-preview.fig
│   └── invoice-detail.fig
├── 05-reports
│   ├── reports-dashboard.fig
│   ├── profit-loss.fig
│   ├── cash-flow.fig
│   ├── balance-sheet.fig
│   └── vat-summary.fig
└── 06-components
    ├── buttons.fig
    ├── forms.fig
    ├── cards.fig
    ├── navigation.fig
    └── charts.fig
```

---

## Animation & Micro-interactions

### Page Transitions
- Slide left/right for step-by-step flows
- Fade for modal overlays
- Slide up for bottom sheets

### Micro-interactions
- Button press: Scale down 0.95
- Success: Checkmark animation
- Loading: Pulsing shimmer
- Pull to refresh: Elastic bounce
- Swipe actions: Reveal delete/edit

### Timing
- Fast: 200ms (buttons, toggles)
- Medium: 300ms (page transitions)
- Slow: 500ms (success celebrations)

---

## Next Steps for Design
1. Create high-fidelity mockups in Figma
2. Build component library in Figma with variants
3. Create interactive prototype for user testing
4. Conduct usability testing with SME owners in East Africa
5. Iterate based on feedback
6. Hand off to development with design tokens
