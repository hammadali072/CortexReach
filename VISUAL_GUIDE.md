# 🎨 CortexReach - Visual Design Guide

## Page-by-Page Visual Layout

### 🏠 Dashboard (`/`)

```
┌─────────────────────────────────────────────────────┐
│ Dashboard                                           │
│ Welcome back! Here's what's happening...            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐
│  │📊 2,345  │  │📧 48,362 │  │📬 42.8% │  │📈 12 │
│  │Total     │  │Emails    │  │Open     │  │Active│
│  │Leads     │  │Sent      │  │Rate     │  │Camps │
│  │+12.5% ↗️ │  │+8.2% ↗️  │  │-2.1% ↘️ │  │+3 ↗️ │
│  └──────────┘  └──────────┘  └──────────┘  └──────┘
│                                                     │
│  Recent Campaigns                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Campaign Name    │ Status  │ Sent │ Opened │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Q1 Outreach      │🟢Active│ 1,234│   456  │   │
│  │ Product Launch   │🟢Active│   892│   301  │   │
│  │ Follow-up        │🟡Paused│   567│   198  │   │
│  │ Cold Outreach #5 │⚪Done  │ 2,100│   834  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │➕ Create   │ │👤 Import   │ │📊 View     │  │
│  │  Campaign  │ │   Leads    │ │  Analytics │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### 👥 Leads (`/leads`)

```
┌─────────────────────────────────────────────────────┐
│ Leads                             [➕ Import Leads] │
│ Manage and track your contact database              │
├─────────────────────────────────────────────────────┤
│ 🔍 [Search...        ] [Status ▾] [🔽] [⬇️ Export] │
├─────────────────────────────────────────────────────┤
│ ☐ │ Name           │ Company    │ Status  │ Tags   │
├───┼────────────────┼────────────┼─────────┼────────┤
│ ☐ │ John Smith     │ TechCorp   │🔵New   │ Tech   │
│   │ john@tech.com  │            │         │ Enter. │
├───┼────────────────┼────────────┼─────────┼────────┤
│ ☐ │ Sarah Johnson  │ Innovate   │🟢Opened│ SaaS   │
│   │ sarah@inv.io   │            │         │ Sales  │
├───┼────────────────┼────────────┼─────────┼────────┤
│ ☐ │ Michael Chen   │ Growth Co. │⚪Ignore│ Market │
│   │ mchen@grow.com │            │         │ Mid-M  │
└─────────────────────────────────────────────────────┘
  Showing 1 to 5 of 5        [< Previous] [Next >]
```

---

### 📧 Campaigns (`/campaigns`)

```
┌─────────────────────────────────────────────────────┐
│ Campaigns                         [➕ Create Campaign]│
│ Create and manage your email campaigns              │
├─────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │  4   │ │  2   │ │  1   │ │  1   │               │
│ │Total │ │Active│ │Drafts│ │Done  │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │ Q1 Outreach Campaign        🔵 Sent          │   │
│ │ Subject: Exclusive Partnership Opportunity    │   │
│ │ Created: 2026-01-15 • Last: 2026-01-24      │   │
│ │                                               │   │
│ │ Recipients: 1,234  Sent: 1,234  Open: 456   │   │
│ │ ▓▓▓▓▓▓░░░░ 37% Open Rate                    │   │
│ │                      [👁️ View] [✏️ Edit]     │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Product Launch Series       🔵 Sent          │   │
│ │ Subject: Introducing Our New Feature         │   │
│ │ Created: 2026-01-18 • Last: 2026-01-24      │   │
│ │                                               │   │
│ │ Recipients: 892   Sent: 892   Open: 301     │   │
│ │ ▓▓▓▓▓▓▓░░░ 33% Open Rate                    │   │
│ │                      [👁️ View] [✏️ Edit]     │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

### ➕ Campaign Create (`/campaigns/create`)

```
┌─────────────────────────────────────────────────────┐
│ Create New Campaign                                 │
│ Set up your email outreach campaign in 4 steps      │
├─────────────────────────────────────────────────────┤
│  ●───────  ○───────  ○───────  ○                   │
│  Details   Content   Audience   Review             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Campaign Details                                   │
│                                                     │
│  Campaign Name *                                    │
│  [e.g., Q1 Outreach Campaign                    ]  │
│                                                     │
│  Email Subject Line *                               │
│  [e.g., Quick question about your team          ]  │
│                                                     │
│  Campaign Description                               │
│  [Describe the purpose...                       ]  │
│  [                                               ]  │
│  [                                               ]  │
│                                                     │
├─────────────────────────────────────────────────────┤
│              [💾 Save as Draft]  [Next Step →]     │
└─────────────────────────────────────────────────────┘
```

Step 2 shows email editor, Step 3 shows lead selection, Step 4 shows review summary.

---

### 🔄 Sequences (`/sequences`)

```
┌─────────────────────────────────────────────────────┐
│ Sequences                      [➕ Create Sequence] │
│ Automate your follow-up emails...                   │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │ Welcome Series          🟢 Active  (4 steps) │   │
│ │ Initial outreach and follow-up for new leads │   │
│ │                                               │   │
│ │ Enrolled: 245    Completed: 89               │   │
│ │ ▓▓▓▓░░░░░░ 36% completion                    │   │
│ │                      [👁️ View] [✏️ Edit]     │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ Re-engagement Flow      🟢 Active  (3 steps) │   │
│ │ Win back cold leads with targeted messages   │   │
│ │                                               │   │
│ │ Enrolled: 156    Completed: 67               │   │
│ │ ▓▓▓▓▓▓░░░░ 43% completion                    │   │
│ │                      [👁️ View] [✏️ Edit]     │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ℹ️ What are sequences?                              │
│ Sequences are automated email workflows triggered   │
│ by lead engagement. Set up follow-up emails based   │
│ on opens, clicks, and replies...                    │
└─────────────────────────────────────────────────────┘
```

---

### 📊 Analytics (`/analytics`)

```
┌─────────────────────────────────────────────────────┐
│ Analytics                          [Last 7 days ▾] │
│ Track and analyze your campaign performance         │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ │ 12,456   │ │ 3,284    │ │ 892      │ │ 2.4%     │
│ │ Opens    │ │ Clicks   │ │ Replies  │ │ Bounce   │
│ │ ↗️ +15.3%│ │ ↗️ +8.7% │ │ ↗️ +22.1%│ │ ↘️ -1.2% │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘
├─────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌─────────────────────────┐  │
│ │ Engagement       │  │ Top Campaigns           │  │
│ │                  │  │ 1. Q1 Outreach          │  │
│ │ Mon  ▓▓▓▓▓▓░ 234│  │    Open: 48.2%          │  │
│ │ Tue  ▓▓▓▓▓▓▓ 289│  │    Reply: 12.3%         │  │
│ │ Wed  ▓▓▓▓▓▓░ 256│  │                         │  │
│ │ Thu  ▓▓▓▓▓▓▓ 312│  │ 2. Product Launch       │  │
│ │ Fri  ▓▓▓▓░░░ 198│  │    Open: 45.8%          │  │
│ └──────────────────┘  │    Reply: 10.1%         │  │
│                       └─────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ Detailed Metrics                                    │
│ ├─────────────┼───────┼──────┼──────────┤          │
│ │ Metric      │ Count │ Rate │ Change   │          │
│ ├─────────────┼───────┼──────┼──────────┤          │
│ │ Sent        │48,362 │  -   │ +8.2%    │          │
│ │ Opened      │12,456 │25.8% │ +15.3%   │          │
│ │ Clicked     │ 3,284 │ 6.8% │ +8.7%    │          │
│ └─────────────┴───────┴──────┴──────────┘          │
└─────────────────────────────────────────────────────┘
```

---

### ⚙️ Settings (`/settings`)

```
┌─────────────────────────────────────────────────────┐
│ Settings                                            │
│ Manage your account and application preferences     │
├─────┬───────────────────────────────────────────────┤
│ 👤  │ Profile Information                           │
│ Profile                                             │
│     │ Profile Picture                               │
│ 📧  │  👤  [Change Photo]                           │
│ Email│  JPG, PNG. Max 2MB                           │
│     │                                               │
│ 🔔  │ Full Name                                     │
│ Notif│ [John Doe                                 ]  │
│     │                                               │
│ 🔑  │ Email Address                                 │
│ API  │ [john@example.com                         ]  │
│     │                                               │
│     │ Company                                       │
│     │ [Example Corp                             ]  │
│     │                                               │
│     │ Phone Number                                  │
│     │ [+1 (555) 123-4567                        ]  │
│     │                                               │
│     │ [Save Changes]                                │
└─────┴───────────────────────────────────────────────┘
```

Other tabs show Email Settings, Notifications toggles, and API Keys.

---

## 🎨 Color Coding

- 🔵 **Blue** - Active, Primary actions
- 🟢 **Green** - Success, Completed, Positive metrics
- 🟡 **Yellow** - Warning, Paused
- 🔴 **Red** - Danger, Error
- ⚪ **Gray** - Inactive, Neutral

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Sidebar visible and sticky
- Full table columns visible
- 4-column grid layouts
- Search bar visible

### Tablet (768px - 1024px)
- Sidebar toggleable
- 2-column grid layouts
- Tables remain scrollable
- Search bar visible

### Mobile (< 768px)
- Hamburger menu for sidebar
- Single column layouts
- Cards stack vertically
- Search hidden (shows on interaction)

---

## 🎯 Interactive Elements

### Hover States
- Cards: shadow-md on hover
- Buttons: darker background
- Table rows: gray-50 background
- Links: underline appears

### Active States
- Sidebar links: blue-50 background + blue-600 text
- Form inputs: blue-500 ring on focus
- Checkboxes: blue-600 when checked

### Transitions
- All: `transition-colors duration-200`
- Shadows: `transition-shadow`
- Sidebar: `transition-transform duration-300`

---

## 🔤 Typography Hierarchy

```
Page Title (h2)     - 2xl-44px, bold, gray-800
Section Title (h4)  - lg-2xl, bold, gray-900
Card Title (h5)     - base-xl, medium/bold, gray-900
Body Text (p)       - base, normal, gray-700
Secondary (p)       - small, normal, gray-600
Tertiary (p)        - extra-small, normal, gray-500
```

---

## ✨ Visual Delight

### Subtle Animations
- Hover effects on cards and buttons
- Smooth transitions between states
- Progress bars animate on render
- Dropdown menus slide in

### Iconography
- Font Awesome icons throughout
- Consistent sizing (text-xl for large icons)
- Color-matched to actions (blue for primary, red for delete)

### Spacing Rhythm
- Consistent gaps: 4, 6 units
- Card padding: 6 units (24px)
- Section spacing: 6 units vertically

---

**This is a clean, professional SaaS dashboard that feels modern and polished!** 🎨✨
