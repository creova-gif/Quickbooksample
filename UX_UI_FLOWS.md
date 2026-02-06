# UX/UI DESIGN FLOWS - FIGMA READY

Complete user experience flows for the East Africa Accounting Platform (Web + Mobile).

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary (Blue):    #3b82f6
Success (Green):   #10b981
Warning (Amber):   #f59e0b
Danger (Red):      #ef4444
Info (Indigo):     #6366f1

Neutral:
  - Gray 50:  #f9fafb
  - Gray 100: #f3f4f6
  - Gray 300: #d1d5db
  - Gray 500: #6b7280
  - Gray 700: #374151
  - Gray 900: #111827

Country Colors:
  - Kenya (KE):     #006600 (Green)
  - Tanzania (TZ):  #1EB53A (Blue-Green)
  - Uganda (UG):    #FCDC04 (Yellow)
  - Rwanda (RW):    #00A1DE (Blue)
  - Burundi (BI):   #CE1126 (Red)
```

### Typography
```
Headings:
  H1: 32px, Bold, Gray-900
  H2: 24px, Bold, Gray-900
  H3: 20px, Semibold, Gray-900
  H4: 18px, Semibold, Gray-700

Body:
  Large: 16px, Regular, Gray-700
  Medium: 14px, Regular, Gray-700
  Small: 12px, Regular, Gray-600
  
Font Family: Inter (fallback: System UI)
```

### Spacing
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### Components
- Buttons: 44px min height (mobile touch target)
- Input fields: 48px height
- Cards: 8px border radius, 1px border, shadow-sm
- Icons: 20px standard, 16px small, 24px large

---

## 📱 USER FLOWS

### 1. ONBOARDING FLOW

**Screens:**
1. Welcome
2. Country Selection
3. Business Information
4. Tax Details
5. Account Setup
6. Success / Dashboard

**Flow Diagram:**
```
START
  ↓
[Welcome Screen]
  - App logo
  - Tagline: "Smart Accounting for East Africa"
  - CTA: "Get Started"
  - Link: "Already have an account? Sign in"
  ↓
[Country Selection]
  - Title: "Select Your Country"
  - Grid of 5 countries with flags
    🇰🇪 Kenya
    🇹🇿 Tanzania
    🇺🇬 Uganda
    🇷🇼 Rwanda
    🇧🇮 Burundi
  - Each shows: Flag, Name, Currency, VAT%
  - On selection → Shows compliance system info
  ↓
[Business Information]
  - Business Name* (text input)
  - Industry (dropdown)
  - Phone Number (tel input with country code)
  - Email (email input)
  - Address (text area)
  - Progress: 1/4
  ↓
[Tax Details]
  - Tax ID/PIN (text input with country-specific label)
    • Kenya: "KRA PIN"
    • Tanzania/Uganda/Rwanda: "TIN"
    • Burundi: "NIF"
  - Registration Number (optional)
  - VAT Registered (toggle)
  - Compliance info card (country-specific)
  - Progress: 2/4
  ↓
[Account Setup]
  - Full Name
  - Email*
  - Password* (with strength indicator)
  - Confirm Password*
  - Agree to Terms (checkbox)
  - Progress: 3/4
  ↓
[Success]
  - Checkmark animation
  - "You're All Set! 🎉"
  - Business summary:
    • Business Name
    • Country + Flag
    • Currency
    • VAT Rate
  - CTA: "Go to Dashboard"
  - Progress: 4/4
  ↓
[Dashboard]
```

**Figma Frame Names:**
- `onboarding-01-welcome`
- `onboarding-02-country-select`
- `onboarding-03-business-info`
- `onboarding-04-tax-details`
- `onboarding-05-account-setup`
- `onboarding-06-success`

---

### 2. INVOICE CREATION FLOW

**Screens:**
1. Invoice List
2. New Invoice Form
3. Add Line Items
4. Preview Invoice
5. Send Options
6. Confirmation

**Flow Diagram:**
```
[Invoice List]
  - Search bar
  - Filter chips: All, Draft, Sent, Paid, Overdue
  - List of invoice cards showing:
    • Invoice number
    • Customer name
    • Amount
    • Status badge
    • Due date
  - FAB: "+ New Invoice"
  ↓
[New Invoice Form - Customer]
  - Customer search/select (autocomplete)
  - OR "Add New Customer" inline form
  - Fields if new:
    • Name*
    • Email
    • Phone
    • Tax ID (country-specific label)
    • Address
  - Next button
  ↓
[New Invoice Form - Details]
  - Invoice Date (date picker)
  - Due Date (date picker with quick options: +7d, +30d, +60d)
  - Reference (optional)
  - Currency (auto-filled from business)
  - Next button
  ↓
[Add Line Items]
  - List of items (initially 1 empty)
  - Each item:
    • Description*
    • Quantity* (number)
    • Unit Price* (currency input)
    • VAT % (auto-filled from country, editable)
    • Subtotal (calculated)
    • Delete button (if >1 item)
  - "+ Add Item" button
  - Bottom sheet showing:
    • Subtotal: KES 100,000
    • VAT (16%): KES 16,000
    • Total: KES 116,000
  - Next button
  ↓
[Additional Details]
  - Notes (text area) - optional
  - Payment Terms (dropdown or text)
  - Attachment upload (optional)
  - Save as Draft / Continue to Preview
  ↓
[Invoice Preview]
  - Full invoice layout (PDF-style)
  - Header: Business info
  - Customer: Bill to info
  - Items table
  - Totals
  - Footer: Terms & notes
  - Compliance badge: "Ready for [TIMS/EFRIS/VFD/EBM]"
  - Actions:
    • Edit
    • Save as Draft
    • Send Invoice
  ↓
[Send Options]
  - Email to customer (toggle, pre-filled)
  - Custom message (text area)
  - Submit to tax authority (auto-enabled)
  - Send reminders (toggle)
  - CTA: "Send Invoice"
  ↓
[Confirmation]
  - Success animation
  - "Invoice Sent! ✅"
  - Details:
    • Invoice #: INV-KE-202401-0123
    • TIMS ID: KE-2024-000123
    • QR Code (displayed)
  - Actions:
    • View Invoice
    • Download PDF
    • Share
    • Back to Invoices
```

**Figma Frame Names:**
- `invoice-01-list`
- `invoice-02-form-customer`
- `invoice-03-form-details`
- `invoice-04-add-items`
- `invoice-05-additional`
- `invoice-06-preview`
- `invoice-07-send-options`
- `invoice-08-confirmation`

---

### 3. RECEIPT SCANNING FLOW (Mobile)

**Screens:**
1. Transaction Entry Point
2. Camera Scanner
3. OCR Processing
4. Review Extracted Data
5. Categorize
6. Save

**Flow Diagram:**
```
[Transaction List / Add Button]
  - Options bottom sheet:
    • Manual Entry
    • Scan Receipt 📸
    • Import from Bank
  ↓
[Camera Scanner]
  - Full screen camera view
  - Scan frame overlay (receipt shape)
  - Instruction: "Position receipt within frame"
  - Capture button (large circle)
  - Flash toggle
  - Cancel button
  ↓
[OCR Processing]
  - Loading animation
  - Progress indicator
  - "Extracting receipt data..."
  - (Processing happens in background)
  ↓
[Review Extracted Data]
  - Receipt image thumbnail
  - Extracted fields (editable):
    • Merchant: "Java House" ✓ (confidence badge: 92%)
    • Date: "2024-01-15" ✓ (high confidence)
    • Amount: "2,500.00" ✓
    • VAT: "400.00" ✓
    • Items: (expandable list)
      - Cappuccino x2: 1,000
      - Sandwich x1: 1,500
  - Confidence badges: High (green), Medium (yellow), Low (red)
  - Edit icon next to each field
  - Next button
  ↓
[Categorize]
  - AI Suggestion card:
    • "Office Supplies" (85% confidence)
    • Reason: "Based on description and merchant"
  - Alternative categories:
    • Client Entertainment (65%)
    • Other Expenses (20%)
  - Custom category picker
  - Add tags (optional)
  - Next button
  ↓
[Payment Method]
  - Select payment method:
    • M-Pesa
    • Bank Transfer
    • Cash
    • Card
  - Payment details (if applicable)
  - Reference number
  - Save button
  ↓
[Success]
  - Checkmark animation
  - "Transaction Saved!"
  - Summary:
    • Amount: KES 2,500
    • Category: Office Supplies
    • Date: Jan 15, 2024
  - Actions:
    • View Transaction
    • Add Another
    • Done
```

**Figma Frame Names:**
- `receipt-01-entry-point`
- `receipt-02-camera-scanner`
- `receipt-03-processing`
- `receipt-04-review-data`
- `receipt-05-categorize`
- `receipt-06-payment-method`
- `receipt-07-success`

---

### 4. DASHBOARD OVERVIEW

**Sections:**
```
[Dashboard - Desktop]

┌─────────────────────────────────────────────────────────┐
│ Header                                                   │
│  Business Name    🇰🇪 Kenya    [Online ●]   [Profile ▼] │
└─────────────────────────────────────────────────────────┘
│ Sidebar                                                  │
│  🏠 Dashboard    (active)                               │
│  📝 Invoices                                            │
│  💰 Transactions                                        │
│  📊 Reports                                             │
│  ⚙️ Settings                                            │
└─────────────────────────────────────────────────────────┘
│ Main Content                                            │
│                                                          │
│  Good afternoon, John 👋                                │
│  Here's your business overview                          │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Total Income │ │Total Expenses│ │  Net Profit  │   │
│  │ KES 7.6M    │ │  KES 4.95M  │ │  KES 2.65M  │   │
│  │ ↗ +12%      │ │  ↘ -5%      │ │  34.87%     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                          │
│  ┌─────────────────────────────────┐                   │
│  │  6-Month Income vs Expenses     │                   │
│  │  [Bar Chart showing trend]      │                   │
│  └─────────────────────────────────┘                   │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Outstanding Invoices  [View All →]         │       │
│  │  ┌─────────────────────────────────────┐   │       │
│  │  │ INV-001  Acme Corp   KES 116,000   │   │       │
│  │  │ Due: Feb 14  [SENT]                 │   │       │
│  │  └─────────────────────────────────────┘   │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Figma Frame Names:**
- `dashboard-desktop-overview`
- `dashboard-mobile-overview`
- `dashboard-widgets-metrics`
- `dashboard-widgets-chart`
- `dashboard-widgets-invoice-list`
- `dashboard-widgets-recent-transactions`

---

### 5. REPORTS FLOW

**Screens:**
1. Reports Hub
2. Select Report Type
3. Configure Parameters
4. View Report
5. Export Options

**Flow Diagram:**
```
[Reports Hub]
  - Grid of report cards:
    • Profit & Loss
    • Tax Summary (VAT)
    • Balance Sheet
    • Cash Flow
    • Sales by Customer
    • Expenses by Category
  - Each card shows:
    • Icon
    • Title
    • Description
    • "Generate →" button
  ↓
[Select Report Type: P&L]
  - Report title
  - Quick presets:
    • This Month
    • Last Month
    • This Quarter
    • This Year
    • Custom
  ↓
[Configure Parameters]
  - Date Range
    • From: [Date Picker]
    • To: [Date Picker]
  - Comparison (optional)
    • Compare with previous period
  - Format
    • Detailed / Summary
  - Generate button
  ↓
[View Report - P&L]
  - Header:
    • Report title
    • Period: Jan 1 - Dec 31, 2024
    • Generated: Jan 15, 2025
  - Revenue Section
    • Sales Revenue: KES 5,000,000
    • Service Revenue: KES 2,500,000
    • Total Revenue: KES 7,500,000
  - Expenses Section
    • (Breakdown by category)
    • Total Expenses: KES 4,950,000
  - Net Profit: KES 2,550,000 (34.0%)
  - Action buttons:
    • Export PDF
    • Export Excel
    • Share
    • Print
  ↓
[Export Options]
  - File format:
    • PDF (default)
    • Excel
    • CSV
  - Include:
    • Charts (toggle)
    • Transaction details (toggle)
    • Company header (toggle)
  - Email to:
    • Input field (optional)
  - Download / Send
```

**Figma Frame Names:**
- `reports-01-hub`
- `reports-02-select-type`
- `reports-03-configure`
- `reports-04-profit-loss`
- `reports-05-tax-summary`
- `reports-06-export-options`

---

### 6. PAYMENT RECORDING FLOW

**Screens:**
1. Outstanding Invoices
2. Record Payment
3. Allocation
4. Payment Method
5. Confirmation

**Flow Diagram:**
```
[Outstanding Invoices List]
  - Filter: Unpaid invoices
  - Each invoice card:
    • Invoice #
    • Customer
    • Amount due
    • Days overdue (if applicable)
    • "Record Payment" button
  ↓
[Record Payment Form]
  - Invoice info (read-only):
    • Invoice #: INV-KE-202401-0001
    • Customer: Acme Corporation
    • Total: KES 116,000
    • Amount Paid: KES 0
    • Balance Due: KES 116,000
  - Payment details:
    • Payment Date (date picker)
    • Amount Received* (currency input)
      - Quick buttons: Full Amount, 50%, 25%
    • Reference Number (optional)
  - Next button
  ↓
[Payment Method]
  - Select method:
    • 📱 Mobile Money (M-Pesa, Airtel, etc.)
    • 🏦 Bank Transfer
    • 💵 Cash
    • 💳 Card
  - If Mobile Money:
    • Provider (dropdown)
    • Phone Number
    • Transaction ID*
  - If Bank:
    • Bank Name
    • Account Number (last 4 digits)
    • Reference
  - Next button
  ↓
[Allocation] (if partial payment)
  - If payment < total, show allocation:
    • Apply to this invoice: KES 50,000
    • Keep as credit: KES 0
  - OR allocate to multiple invoices
  - Confirm button
  ↓
[Confirmation]
  - Success animation
  - "Payment Recorded! ✅"
  - Summary:
    • Amount: KES 116,000
    • Method: M-Pesa
    • Invoice: PAID IN FULL
  - Next steps:
    • Send Receipt to Customer
    • View Invoice
    • Record Another Payment
    • Done
```

**Figma Frame Names:**
- `payment-01-outstanding-invoices`
- `payment-02-record-form`
- `payment-03-method`
- `payment-04-allocation`
- `payment-05-confirmation`

---

### 7. TAX FILING FLOW

**Screens:**
1. Tax Dashboard
2. Create Tax Return
3. Review Calculations
4. Submit to Authority
5. Confirmation

**Flow Diagram:**
```
[Tax Dashboard]
  - Current period card:
    • Period: Jan - Mar 2024
    • Status: Due Apr 20, 2024
    • VAT Payable: KES 800,000
    • [File Return] button
  - Past returns list:
    • Q4 2023: Filed ✓
    • Q3 2023: Filed ✓
  - Upcoming obligations
  ↓
[Create VAT Return]
  - Select period:
    • Q1 2024 (Jan-Mar)
  - Auto-calculate from transactions
  - Loading: "Calculating VAT..."
  ↓
[Review Calculations]
  - Period: Q1 2024 (Jan 1 - Mar 31)
  - Sales & Output VAT:
    • Total Sales (incl. VAT): KES 10,000,000
    • VAT Collected (16%): KES 1,600,000
  - Purchases & Input VAT:
    • Total Purchases: KES 5,000,000
    • VAT Paid: KES 800,000
  - Summary:
    • Net VAT Payable: KES 800,000
  - Breakdown table (expandable)
  - Actions:
    • Edit (adjust manually)
    • Generate Report
    • Submit to [KRA/URA/TRA/RRA]
  ↓
[Submit to Authority]
  - Compliance check:
    ✓ All invoices submitted
    ✓ Calculations verified
    ✓ No pending amendments
  - Submission details:
    • Authority: KRA (Kenya)
    • System: TIMS
    • Filing Deadline: Apr 20, 2024
  - Confirmation checkbox:
    "I certify that this return is correct"
  - Submit button
  ↓
[Submission Processing]
  - Loading screen
  - "Submitting to KRA..."
  - Progress steps:
    ✓ Validating data
    ✓ Generating payload
    ⏳ Submitting to TIMS
  ↓
[Confirmation]
  - Success animation
  - "VAT Return Filed! ✅"
  - Details:
    • Reference: KRA-VAT-2024-Q1-123456
    • Filed: Apr 15, 2024 10:30 AM
    • Amount Due: KES 800,000
    • Payment Deadline: Apr 20, 2024
  - Actions:
    • Download Receipt
    • Make Payment
    • Email Copy
    • Done
```

**Figma Frame Names:**
- `tax-01-dashboard`
- `tax-02-create-return`
- `tax-03-review-calc`
- `tax-04-submit`
- `tax-05-processing`
- `tax-06-confirmation`

---

## 🎯 INTERACTION PATTERNS

### Mobile Gestures
- **Swipe Right**: Go back / Close
- **Swipe Left on List Item**: Delete / Archive
- **Pull to Refresh**: Refresh data
- **Long Press**: Context menu
- **Pinch to Zoom**: Charts and images

### Empty States
- **No Invoices**: "No invoices yet. Create your first invoice to get started." + [Create Invoice] button
- **No Transactions**: "No transactions found. Add your first transaction." + [Add Transaction] button
- **No Data for Report**: "Not enough data to generate this report. Add transactions first."
- **Search No Results**: "No results for '{query}'. Try different keywords."

### Loading States
- **Skeleton Screens**: For lists and cards
- **Spinner**: For full-page loading
- **Progress Bar**: For file uploads and long operations
- **Inline Loader**: For button states

### Error States
- **Network Error**: "No internet connection. Changes will sync when you're back online."
- **Validation Error**: Inline field errors with red border + error message
- **Server Error**: "Something went wrong. Please try again." + [Retry] button
- **Permission Error**: "You don't have permission to perform this action."

### Success States
- **Checkmark Animation**: Green checkmark with scale-in animation
- **Toast Notification**: Bottom toast for non-critical actions
- **Confetti**: For major milestones (first invoice sent, etc.)

---

## 📐 RESPONSIVE BREAKPOINTS

```
Mobile:     320px - 767px
Tablet:     768px - 1023px
Desktop:    1024px - 1439px
Large:      1440px+
```

### Mobile-First Adaptations
- **Navigation**: Bottom tab bar → Side drawer on tablet/desktop
- **Forms**: Single column → Two column on tablet+
- **Tables**: Cards → Full table on desktop
- **Modals**: Full screen → Centered dialog on desktop

---

## ♿ ACCESSIBILITY

### WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for normal text
- Touch targets: Minimum 44x44px
- Keyboard navigation: Full support
- Screen readers: Proper ARIA labels
- Focus indicators: Visible outline on all interactive elements
- Form labels: Associated with inputs

### Internationalization
- Language: English (primary), Swahili (secondary)
- Date formats: Localized per country
- Number formats: Localized decimal/thousand separators
- Currency: Local currency symbols

---

## 🎨 FIGMA ORGANIZATION

### Page Structure
```
📄 Cover
📄 Design System
  - Colors
  - Typography
  - Components
  - Icons
📄 Onboarding Flow
📄 Dashboard
📄 Invoices
📄 Transactions
📄 Receipts & OCR
📄 Reports
📄 Payments
📄 Tax Filing
📄 Settings
📄 Mobile Screens
📄 Responsive Layouts
```

### Component Library
- Buttons (Primary, Secondary, Outline, Ghost)
- Inputs (Text, Number, Date, Select, Textarea)
- Cards (Default, Elevated, Outlined)
- Badges (Status colors)
- Modals & Dialogs
- Bottom Sheets (Mobile)
- Navigation (Sidebar, Bottom Nav, Header)
- Charts (Bar, Line, Pie, Donut)
- Tables (Desktop) / Cards (Mobile)
- Empty States
- Loading States
- Error States

---

## ✅ DESIGN CHECKLIST

Before handoff to development:

- [ ] All screens designed for mobile & desktop
- [ ] Empty states designed
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Success states designed
- [ ] Accessibility annotations added
- [ ] Responsive breakpoints documented
- [ ] Interaction specs documented
- [ ] Animation specs documented
- [ ] Copy reviewed and approved
- [ ] Design system components created
- [ ] Developer handoff notes added

---

**All UX/UI flows are production-ready and Figma-ready!**

This provides a complete blueprint for designers to create pixel-perfect designs and for developers to implement with confidence.
