# UX Flows - East Africa Accounting Platform

## Design Principles
1. **Mobile-First**: 70% of users will access via mobile
2. **Offline-Capable**: Works without internet, syncs when connected
3. **Simple Language**: No accounting jargon, plain English/Swahili
4. **Visual Hierarchy**: Clear CTAs, important actions prominent
5. **Progressive Disclosure**: Show advanced features only when needed

---

## User Flows

### 1. Onboarding Flow (First-Time User)

```
┌──────────────────┐
│  Welcome Screen  │
│                  │
│  "Manage your    │
│   business       │
│   finances       │
│   simply"        │
│                  │
│  [Get Started]   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Country Selection│
│                  │
│  🇰🇪 Kenya       │
│  🇺🇬 Uganda      │
│  🇹🇿 Tanzania    │
│  🇷🇼 Rwanda      │
│  🇧🇮 Burundi     │
│                  │
│  [Continue]      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Account Setup   │
│                  │
│  Email:          │
│  Password:       │
│  Full Name:      │
│  Phone:          │
│                  │
│  [Create Account]│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Business Details │
│                  │
│ Business Name:   │
│ Tax ID (TIN):    │
│ Industry:        │
│ VAT Registered?  │
│   ◉ Yes  ○ No    │
│                  │
│  [Continue]      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Tax Setup       │
│  (Country-Based) │
│                  │
│ KENYA:           │
│ - TIMS Device ID │
│ - KRA PIN        │
│                  │
│ UGANDA:          │
│ - EFRIS Device # │
│ - URA TIN        │
│                  │
│  [Complete Setup]│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Dashboard      │
│  (Empty State)   │
│                  │
│ "Let's get       │
│  started!"       │
│                  │
│ [+ Add Income]   │
│ [+ Add Expense]  │
│ [+ Create Invoice│
└──────────────────┘
```

---

### 2. Dashboard - Home Screen (Mobile-First)

```
┌─────────────────────────────────┐
│ ☰  East Africa Accounting   🔔 │
├─────────────────────────────────┤
│                                 │
│  Hi, John! 👋                   │
│  Nairobi Traders Ltd            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Today's Summary        │   │
│  │                         │   │
│  │  💰 Income: KES 45,000  │   │
│  │  💸 Expenses: KES 12,500│   │
│  │  📊 Profit: KES 32,500  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Quick Actions          │   │
│  │                         │   │
│  │  [+ Income]  [+ Expense]│   │
│  │  [+ Invoice] [Reports]  │   │
│  └─────────────────────────┘   │
│                                 │
│  Recent Transactions            │
│  ┌─────────────────────────┐   │
│  │ Office Rent             │   │
│  │ KES 25,000              │   │
│  │ 15 Jan 2026        Paid │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Client Payment - ABC    │   │
│  │ KES 50,000              │   │
│  │ 14 Jan 2026    Received │   │
│  └─────────────────────────┘   │
│                                 │
│  Unpaid Invoices (2)            │
│  ┌─────────────────────────┐   │
│  │ INV-001 - ABC Corp      │   │
│  │ KES 75,000              │   │
│  │ Due: 20 Jan 2026   ⚠️   │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Compliance Status      │   │
│  │  🇰🇪 TIMS: ✅ Active     │   │
│  │  VAT Filing: Due 20 Jan │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
│ [Home] [Invoices] [Reports] [+] │
└─────────────────────────────────┘
```

---

### 3. Create Invoice Flow

```
┌─────────────────────────────────┐
│ ← New Invoice              Save │
├─────────────────────────────────┤
│                                 │
│  Customer Details               │
│  Name: ___________________      │
│  Email: __________________      │
│  Phone: __________________      │
│  [+ Select from Contacts]       │
│                                 │
│  Invoice Details                │
│  Invoice #: INV-005 (auto)      │
│  Date: 15 Jan 2026              │
│  Due Date: [Select Date]        │
│                                 │
│  Items                          │
│  ┌─────────────────────────┐   │
│  │ Web Design Services     │   │
│  │ Qty: 1  @KES 50,000     │   │
│  │                  50,000 │   │
│  └─────────────────────────┘   │
│  [+ Add Item]                   │
│                                 │
│  Subtotal:        KES 50,000    │
│  VAT (16%):       KES  8,000    │
│  ────────────────────────       │
│  Total:           KES 58,000    │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🇰🇪 TIMS Compliance      │   │
│  │ CU Serial: 123456789    │   │
│  │ QR Code: [Auto-generate]│   │
│  └─────────────────────────┘   │
│                                 │
│  [Preview] [Save Draft] [Send]  │
│                                 │
└─────────────────────────────────┘
```

**Invoice Preview Screen:**
```
┌─────────────────────────────────┐
│ ← Invoice Preview          Send │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ NAIROBI TRADERS LTD     │   │
│  │ P.O. Box 12345, Nairobi │   │
│  │ TIN: P051234567M        │   │
│  │                         │   │
│  │ INVOICE #INV-005        │   │
│  │                         │   │
│  │ Bill To:                │   │
│  │ ABC Corporation         │   │
│  │ abc@example.com         │   │
│  │                         │   │
│  │ Date: 15 Jan 2026       │   │
│  │ Due: 15 Feb 2026        │   │
│  │                         │   │
│  │ ┌─────────────────────┐ │   │
│  │ │ Description    Amt  │ │   │
│  │ │ Web Design  50,000  │ │   │
│  │ │ VAT (16%)    8,000  │ │   │
│  │ │ ──────────────────  │ │   │
│  │ │ TOTAL       58,000  │ │   │
│  │ └─────────────────────┘ │   │
│  │                         │   │
│  │ [QR Code for TIMS]      │   │
│  │ CU: 123456789           │   │
│  │                         │   │
│  │ Pay via M-Pesa:         │   │
│  │ Paybill: 123456         │   │
│  │ Account: INV-005        │   │
│  └─────────────────────────┘   │
│                                 │
│  [Download PDF] [Share]         │
│  [Send via Email] [Send via SMS]│
│                                 │
└─────────────────────────────────┘
```

---

### 4. Add Expense Flow (Simplified)

```
┌─────────────────────────────────┐
│ ← Add Expense              Save │
├─────────────────────────────────┤
│                                 │
│  What did you buy?              │
│  ___________________________    │
│  (e.g., "Office supplies")      │
│                                 │
│  How much?                      │
│  KES ______________________     │
│                                 │
│  Category (AI Suggested)        │
│  ┌─────────────────────────┐   │
│  │ 🤖 Office Supplies      │   │
│  │    (95% confident)      │   │
│  └─────────────────────────┘   │
│                                 │
│  Or choose manually:            │
│  [Rent] [Utilities] [Transport] │
│  [Marketing] [Other...]         │
│                                 │
│  Payment Method                 │
│  ◉ Cash  ○ M-Pesa  ○ Bank       │
│                                 │
│  Receipt (Optional)             │
│  [📷 Take Photo] [📎 Upload]    │
│                                 │
│  Date: 15 Jan 2026              │
│                                 │
│  Notes (Optional)               │
│  ___________________________    │
│                                 │
│  [Save Expense]                 │
│                                 │
└─────────────────────────────────┘
```

**AI Suggestion Dialog:**
```
┌─────────────────────────────────┐
│  Smart Categorization 🤖        │
├─────────────────────────────────┤
│                                 │
│  "Office supplies from Nakumatt"│
│                                 │
│  We suggest:                    │
│  ✅ Office Supplies (95%)       │
│                                 │
│  Other suggestions:             │
│  • Operating Expenses (72%)     │
│  • General Expenses (45%)       │
│                                 │
│  [Accept] [Change Category]     │
│                                 │
└─────────────────────────────────┘
```

---

### 5. Reports Screen

```
┌─────────────────────────────────┐
│ ☰  Reports                  📊  │
├─────────────────────────────────┤
│                                 │
│  Period: [This Month ▼]         │
│  From: 01 Jan 26  To: 31 Jan 26 │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Financial Reports      │   │
│  │                         │   │
│  │  📈 Profit & Loss       │   │
│  │     KES 125,000 profit  │   │
│  │                         │   │
│  │  💰 Balance Sheet       │   │
│  │     Assets: 2.5M        │   │
│  │                         │   │
│  │  💵 Cash Flow           │   │
│  │     +KES 45,000         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Tax Reports (Kenya)    │   │
│  │                         │   │
│  │  🧾 VAT Summary         │   │
│  │     Payable: KES 12,500 │   │
│  │     Due: 20 Jan 2026    │   │
│  │                         │   │
│  │  [File VAT Return]      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Insights 🔍            │   │
│  │                         │   │
│  │  • Top expense: Rent    │   │
│  │  • Revenue up 15%       │   │
│  │  • 2 overdue invoices   │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Profit & Loss Detail:**
```
┌─────────────────────────────────┐
│ ← Profit & Loss Report     📥   │
├─────────────────────────────────┤
│  January 2026                   │
│                                 │
│  Revenue                        │
│  ├─ Sales Revenue   KES 200,000 │
│  ├─ Service Income  KES 150,000 │
│  └─ Total Revenue   KES 350,000 │
│                                 │
│  Expenses                       │
│  ├─ Rent            KES  50,000 │
│  ├─ Salaries        KES 100,000 │
│  ├─ Utilities       KES  15,000 │
│  ├─ Marketing       KES  20,000 │
│  └─ Total Expenses  KES 185,000 │
│                                 │
│  ═══════════════════════════    │
│  Net Profit         KES 165,000 │
│  ═══════════════════════════    │
│                                 │
│  [Export PDF] [Export Excel]    │
│                                 │
│  📊 Chart View                  │
│  ┌─────────────────────────┐   │
│  │     Revenue vs Expenses │   │
│  │  █████████████ Revenue  │   │
│  │  ██████ Expenses        │   │
│  │  ███████ Profit         │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### 6. Mobile Money Payment Flow (M-Pesa)

**From Invoice:**
```
┌─────────────────────────────────┐
│  Pay Invoice #INV-005           │
├─────────────────────────────────┤
│                                 │
│  Amount: KES 58,000             │
│                                 │
│  Payment Method                 │
│  ◉ M-Pesa                       │
│  ○ Airtel Money                 │
│  ○ Bank Transfer                │
│  ○ Cash                         │
│                                 │
│  M-Pesa Phone Number            │
│  +254 __ __ __ __ __ __         │
│                                 │
│  [Request Payment]              │
│                                 │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Payment Initiated 📱           │
├─────────────────────────────────┤
│                                 │
│  Check your phone for M-Pesa    │
│  payment request                │
│                                 │
│  Enter your M-Pesa PIN to       │
│  complete payment               │
│                                 │
│  Amount: KES 58,000             │
│  To: Nairobi Traders Ltd        │
│  Ref: INV-005                   │
│                                 │
│  ⏳ Waiting for confirmation... │
│                                 │
│  [Cancel Payment]               │
│                                 │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Payment Successful ✅          │
├─────────────────────────────────┤
│                                 │
│  KES 58,000 received            │
│                                 │
│  From: 254712345678             │
│  M-Pesa Ref: QA12BC3DEF         │
│  Date: 15 Jan 2026 14:35        │
│                                 │
│  Invoice #INV-005               │
│  Status: PAID ✅                │
│                                 │
│  [View Receipt] [Done]          │
│                                 │
└─────────────────────────────────┘
```

---

### 7. Compliance Dashboard (Kenya TIMS Example)

```
┌─────────────────────────────────┐
│ ← Tax Compliance (Kenya)   🇰🇪  │
├─────────────────────────────────┤
│                                 │
│  TIMS Status                    │
│  ┌─────────────────────────┐   │
│  │ ✅ Active & Connected    │   │
│  │ CU Serial: 123456789    │   │
│  │ Last Sync: 2 mins ago   │   │
│  └─────────────────────────┘   │
│                                 │
│  VAT Summary (January 2026)     │
│  ┌─────────────────────────┐   │
│  │ Sales (VAT Out)         │   │
│  │ KES 350,000             │   │
│  │ VAT Collected: 56,000   │   │
│  │                         │   │
│  │ Purchases (VAT In)      │   │
│  │ KES 100,000             │   │
│  │ VAT Paid: 16,000        │   │
│  │                         │   │
│  │ ═══════════════════     │   │
│  │ VAT Payable: 40,000     │   │
│  │ Due: 20 Jan 2026  ⚠️    │   │
│  └─────────────────────────┘   │
│                                 │
│  [Download VAT Report]          │
│  [Submit to KRA iTax]           │
│                                 │
│  Recent TIMS Submissions        │
│  ┌─────────────────────────┐   │
│  │ INV-005 - Submitted ✅  │   │
│  │ 15 Jan 2026             │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ INV-004 - Submitted ✅  │   │
│  │ 14 Jan 2026             │   │
│  └─────────────────────────┘   │
│                                 │
│  ⚠️ Reminders                   │
│  • VAT return due in 5 days     │
│  • TIMS device check required   │
│                                 │
└─────────────────────────────────┘
```

---

### 8. Offline Mode Indicator

```
┌─────────────────────────────────┐
│ ☰  Dashboard              ⚠️ 📶 │ ← Offline indicator
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📡 You're Offline       │   │
│  │                         │   │
│  │ Changes will sync when  │   │
│  │ you're back online      │   │
│  │                         │   │
│  │ Pending: 3 transactions │   │
│  │ Last sync: 2 hours ago  │   │
│  └─────────────────────────┘   │
│                                 │
│  [View Pending Changes]         │
│                                 │
└─────────────────────────────────┘
```

**Sync Success:**
```
┌─────────────────────────────────┐
│  ✅ Synced Successfully         │
├─────────────────────────────────┤
│                                 │
│  3 transactions uploaded        │
│  1 invoice submitted to TIMS    │
│  Reports updated                │
│                                 │
│  Last sync: Just now            │
│                                 │
│  [Close]                        │
│                                 │
└─────────────────────────────────┘
```

---

### 9. Settings & Profile

```
┌─────────────────────────────────┐
│ ← Settings                      │
├─────────────────────────────────┤
│                                 │
│  Profile                        │
│  John Kamau                     │
│  john@nairobitraders.com        │
│  [Edit Profile]                 │
│                                 │
│  Business                       │
│  Nairobi Traders Ltd            │
│  TIN: P051234567M               │
│  [Edit Business Details]        │
│                                 │
│  Country & Tax                  │
│  🇰🇪 Kenya                       │
│  VAT: 16%                       │
│  [Change Tax Settings]          │
│                                 │
│  Integrations                   │
│  M-Pesa: ✅ Connected           │
│  TIMS: ✅ Active                │
│  [Manage Integrations]          │
│                                 │
│  Language                       │
│  🇬🇧 English                    │
│  [Change to Swahili]            │
│                                 │
│  Security                       │
│  [Change Password]              │
│  [Two-Factor Authentication]    │
│                                 │
│  Data & Privacy                 │
│  [Export Data]                  │
│  [Delete Account]               │
│                                 │
│  [Logout]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Responsive Design Breakpoints

### Mobile (< 640px)
- Single column layout
- Bottom navigation bar
- Collapsible sections
- Touch-friendly buttons (min 44px height)

### Tablet (640px - 1024px)
- Two-column layout where appropriate
- Side navigation drawer
- Larger chart visualizations

### Desktop (> 1024px)
- Multi-column dashboard
- Persistent sidebar
- Expanded data tables
- Side-by-side forms and previews

---

## Accessibility Features

1. **High Contrast Mode**: For visually impaired users
2. **Screen Reader Support**: Semantic HTML, ARIA labels
3. **Keyboard Navigation**: Full functionality without mouse
4. **Large Touch Targets**: Minimum 44x44px
5. **Clear Focus States**: Visible focus indicators

---

## Color Scheme (Country-Themed)

### Primary Colors
- **Kenya**: Green (#006600) + Red (#BB0000)
- **Uganda**: Yellow (#FCDC04) + Red (#D90000) + Black (#000000)
- **Tanzania**: Blue (#1EB53A) + Yellow (#FCD116)
- **Rwanda**: Blue (#00A1DE) + Yellow (#FAD201)
- **Burundi**: Red (#CE1126) + Green (#1EB53A)

### UI Colors
- Background: #FFFFFF
- Surface: #F5F5F5
- Text Primary: #1A1A1A
- Text Secondary: #666666
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

### Font Sizes (Mobile-First)
- H1: 1.75rem (28px)
- H2: 1.5rem (24px)
- H3: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)

---

## Animations & Micro-interactions

1. **Page Transitions**: Slide in from right (forward), left (back)
2. **Button Press**: Scale down 0.95 on tap
3. **Loading States**: Skeleton screens + pulse animation
4. **Success Feedback**: Checkmark animation + haptic feedback
5. **Error Shake**: Horizontal shake for invalid inputs

---

## Localization (i18n)

### Languages
- English (default)
- Swahili (coming soon)
- Kinyarwanda (coming soon)

### Currency Formatting
- KES: KES 1,000.00
- UGX: UGX 1,000 (no decimals)
- TZS: TZS 1,000
- RWF: RWF 1,000
- BIF: BIF 1,000

### Date Formatting
- Default: DD MMM YYYY (15 Jan 2026)
- Full: Wednesday, 15 January 2026

---

## Error Handling UX

### Network Errors
```
┌─────────────────────────────────┐
│  ⚠️ Connection Issue            │
├─────────────────────────────────┤
│                                 │
│  Couldn't reach the server      │
│                                 │
│  Don't worry, your data is      │
│  saved locally and will sync    │
│  when you're back online        │
│                                 │
│  [Try Again] [Continue Offline] │
│                                 │
└─────────────────────────────────┘
```

### Validation Errors
```
Input field with error:
┌─────────────────────────────────┐
│ Tax ID (TIN)                    │
│ P05123 ⚠️                       │
│ ❌ Invalid format. Use: P051234567M
└─────────────────────────────────┘
```

---

This UX documentation provides a comprehensive guide for implementing a user-friendly, mobile-first accounting platform for East Africa.
