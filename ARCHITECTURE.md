# CortexReach — Complete Project Architecture Documentation

> **Version:** 1.0 | **Date:** 2026-02-19  
> **Stack:** React 19 · React Router DOM 7 · Tailwind CSS 3 · Vite

---

## Table of Contents
1. [Product Philosophy](#1-product-philosophy)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Routing Architecture](#4-routing-architecture)
5. [Layout System](#5-layout-system)
6. [Pages — Detailed Breakdown](#6-pages--detailed-breakdown)
   - 6.1 [SignIn](#61-signin)
   - 6.2 [Dashboard](#62-dashboard)
   - 6.3 [Projects](#63-projects)
   - 6.4 [ProjectDetail](#64-projectdetail)
   - 6.5 [ProjectCreate](#65-projectcreate)
   - 6.6 [Leads](#66-leads)
   - 6.7 [Campaigns](#67-campaigns)
   - 6.8 [CampaignCreate](#68-campaigncreate)
   - 6.9 [CampaignDetail](#69-campaigndetail)
   - 6.10 [Sequences (Follow-Ups)](#610-sequences-follow-ups)
   - 6.11 [Analytics](#611-analytics)
   - 6.12 [Settings](#612-settings)
7. [UI Component Library](#7-ui-component-library)
8. [Google Maps Lead Import Module](#8-google-maps-lead-import-module)
9. [State Management Strategy](#9-state-management-strategy)
10. [Data Layer](#10-data-layer)
11. [Design System](#11-design-system)
12. [Core Business Rules](#12-core-business-rules)

---

## 1. Product Philosophy

CortexReach is an **engagement-based cold email outreach platform**. Its core product rule, enforced throughout every feature, is:

> **"One Signal" Rule:** An initial email is sent once. If the recipient opens it, they become **Eligible** for follow-up. If they do NOT open it, outreach is **automatically stopped**. There are no multi-step drip sequences.

This philosophy drives every architectural decision:
- Leads are always linked to a **Project** (not sent globally).
- Campaigns enforce **project-level relevance** before targeting any lead.
- Follow-ups are limited to **one** step and only for opened leads.
- Analytics tracks **Open Ratio** and **Auto-Stop Efficiency** as primary KPIs.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 | Functional components, hooks |
| **Routing** | React Router DOM 7 | Nested routes, URL params |
| **Styling** | Tailwind CSS 3 | Utility-first, responsive design |
| **Build Tool** | Vite | Fast dev server, HMR |
| **Data Tables** | react-data-table-component | Sortable, paginated, selectable grids |
| **Icons** | Font Awesome 6 (CDN) | UI iconography |
| **Persistence** | localStorage | Semi-persistent project data |
| **Type Hints** | prop-types | Runtime prop validation |

---

## 3. Directory Structure

```
CortexReach/
├── public/
├── src/
│   ├── App.jsx                     # Root router
│   ├── main.jsx                    # React DOM entry point
│   ├── index.css                   # Global Tailwind + font imports
│   │
│   ├── assets/                     # Static assets (images, SVGs)
│   ├── fonts/                      # Custom fonts (idGrotesk, etc.)
│   │
│   ├── data/
│   │   └── mockGooglePlacesResults.js  # 20-record Google Places mock dataset
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       # Shell: Sidebar + Header + Outlet
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   └── Header.jsx          # Top bar with menu toggle
│   │   │
│   │   ├── titleComponent/
│   │   │   └── titleComponent.jsx  # Typography system (h1–h6, p)
│   │   │
│   │   └── ui/
│   │       ├── Badge.jsx               # Status/label chips
│   │       ├── Button.jsx              # Primary, outline, danger variants
│   │       ├── Card.jsx                # Generic content card container
│   │       ├── Input.jsx               # Labeled form input
│   │       ├── Modal.jsx               # Accessible dialog with footer slot
│   │       ├── TemplateCard.jsx        # AI email template selection card
│   │       ├── PersonaCard.jsx         # AI persona display card
│   │       ├── AIAnalysisCard.jsx      # AI product analysis widget
│   │       ├── LeadSourcingModal.jsx   # AI lead sourcing modal
│   │       ├── ABTestResults.jsx       # A/B test comparison widget
│   │       ├── OptimizationInsights.jsx # AI optimization suggestions
│   │       ├── ScalingVisualization.jsx # Scaling metrics visual
│   │       ├── GoogleMapsImportModal.jsx  # Full Google Maps import flow
│   │       ├── GooglePlacesResultsTable.jsx # Results table for Maps modal
│   │       ├── EmailExtractionCell.jsx    # Per-row email scraper cell
│   │       └── ImportSuccessToast.jsx     # Lead import success notification
│   │
│   └── pages/
│       ├── SignIn.jsx
│       ├── home-page.jsx           # Unused placeholder
│       ├── Dashboard.jsx
│       ├── Projects.jsx
│       ├── ProjectDetail.jsx
│       ├── ProjectCreate.jsx
│       ├── Leads.jsx
│       ├── Campaigns.jsx
│       ├── CampaignCreate.jsx
│       ├── CampaignDetail.jsx
│       ├── Sequences.jsx
│       ├── Analytics.jsx
│       └── Settings.jsx
│
├── ARCHITECTURE.md                 # This file
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 4. Routing Architecture

Defined in `App.jsx` using `BrowserRouter` with **nested routes**.

```
/                          → SignIn.jsx         (Auth entry point)
/dashboard                 → AppLayout.jsx      (Persistent shell)
  /dashboard               → Dashboard.jsx      (index route)
  /dashboard/projects      → Projects.jsx
  /dashboard/projects/:id  → ProjectDetail.jsx  (Dynamic param)
  /dashboard/projects/create → ProjectCreate.jsx
  /dashboard/leads         → Leads.jsx
  /dashboard/campaigns     → Campaigns.jsx
  /dashboard/campaigns/:id → CampaignDetail.jsx
  /dashboard/campaigns/create → CampaignCreate.jsx
  /dashboard/sequences     → Sequences.jsx
  /dashboard/analytics     → Analytics.jsx
  /dashboard/settings      → Settings.jsx
*                          → Navigate to /      (Fallback redirect)
```

### Key Patterns
- All dashboard routes are children of `/dashboard` which renders `AppLayout`.
- `AppLayout` uses React Router's `<Outlet />` to inject the active page.
- No authentication guard exists yet (noted with `// Protected in a real app` comment).

---

## 5. Layout System

### `AppLayout.jsx`
The persistent application shell. Manages sidebar open/close state and renders three zones:

```
┌────────────────────────────────────────┐
│  Sidebar (fixed, collapsible)          │
│  ┌──────────────────────────────────┐  │
│  │  Header (top bar)                │  │
│  │──────────────────────────────────│  │
│  │  <main> (scrollable)             │  │
│  │    <Outlet /> ← active page      │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

- **`Sidebar.jsx`**: Navigation links to all dashboard routes. Accepts `isOpen` and `onClose` props for mobile responsiveness.
- **`Header.jsx`**: Top bar with hamburger menu toggle (`onMenuClick` prop).
- **`main`**: `flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6` — scrollable content area.

---

## 6. Pages — Detailed Breakdown

### 6.1 SignIn
**Route:** `/`  
**File:** `pages/SignIn.jsx`

The landing/authentication page. Presents a login form UI. No real authentication is connected — it is a UI prototype only.

---

### 6.2 Dashboard
**Route:** `/dashboard`  
**File:** `pages/Dashboard.jsx`

**Purpose:** Command center showing cross-campaign outreach signals at a glance.

**Key Sections:**
| Section | Description |
|---|---|
| **Stats Grid** | 4 KPI cards: Eligible for Follow-up, Outreach Stopped, Initial Open Ratio, Pending Initial. Each has a hover-animated progress bar. |
| **Outreach Performance Table** | HTML `<table>` showing recent campaigns with Sent / Opened / Stopped / Yield columns. Yield computed dynamically: `Math.round((opened / sent) * 100)%`. |
| **Quick Action Cards** | Two clickable cards: "View Eligible Leads" → `/dashboard/leads?filter=eligible` and "Start New Outreach" → `/dashboard/campaigns/create`. Use `useNavigate`. |

**State:**
- `hoveredCard` — tracks which stat card is hovered to animate its progress bar width.

---

### 6.3 Projects
**Route:** `/dashboard/projects`  
**File:** `pages/Projects.jsx`

**Purpose:** CRUD interface for managing outreach Projects (the top-level entity).

**Key Features:**
- **localStorage persistence**: Project list is initialized from `cortex_projects` in localStorage (3 default projects as fallback). `useEffect` writes changes back on every state update.
- **DataTable**: Sortable columns for Name, Type, Target Audience, Total Leads, Status, and Actions (View / Edit / Delete).
- **Edit Modal**: Inline form using `Input` components. Saves via `setProjects(prev => prev.map(...))`.
- **Delete Modal**: Confirmation dialog that filters the project out of state.

**Data Schema (Project):**
```js
{
  id: Number,
  name: String,
  type: 'Product' | 'Service',
  targetAudience: String,
  description: String,
  industry: String,
  totalLeads: Number,
  status: 'Active' | 'Archived'
}
```

---

### 6.4 ProjectDetail
**Route:** `/dashboard/projects/:id`  
**File:** `pages/ProjectDetail.jsx` (483 lines — most complex page)

**Purpose:** Deep workspace for a single project. Combines lead management, AI sourcing, and campaign history in a tabbed interface.

**Tab Structure:**
```
[ Overview ] [ Leads ] [ Campaigns ]
```

**Overview Tab:**
- Project scope description, Industry & Audience cards.
- Dark "Strategic Enforcement" card showing linked lead/campaign counts.
- `AIAnalysisCard` for AI-driven product intelligence.

**Leads Tab:**
- **"Source Leads via AI"** and **"Import from Google Maps"** buttons.
- **All Project Leads** DataTable (Lead Name+Phone, Email, Company, Source badge, Website link, Relevance, Status).
- **Google Maps flash notice** — emerald banner when `source === 'Google Maps'` leads exist.
- **AI Intelligence Sourcing** section: relevance slider + persona dropdown + AI leads DataTable with score bars.

**Campaigns Tab:**
- DataTable showing project-linked campaigns with Name, Status, Yield, Sent Date.

**State managed:**
```js
activeTab             // 'overview' | 'leads' | 'campaigns'
isSourcingModalOpen   // AI modal
isGoogleMapsModalOpen // Maps modal
importToast           // null | { count: number }
aiLeads               // AI-sourced lead array
relevanceFilter       // 0–90 slider
personaFilter         // '' | persona name
projectLeads          // dynamic array (manual + Google Maps imported)
```

**Lead Data Schema (extended):**
```js
{
  id: Number | String,
  name: String,
  email: String | null,
  company: String,
  phone: String | null,
  website: String | null,
  source: 'Manual' | 'Google Maps',
  relevance: 'High' | 'Medium' | 'Low',
  relevanceScore: Number,   // 60–95 for Google Maps leads
  status: 'Opened' | 'Not Opened' | 'New'
}
```

---

### 6.5 ProjectCreate
**Route:** `/dashboard/projects/create`  
**File:** `pages/ProjectCreate.jsx`

Form page to create a new project and persist it to localStorage.

---

### 6.6 Leads
**Route:** `/dashboard/leads`  
**File:** `pages/Leads.jsx`

**Purpose:** Global view of all leads across all projects with engagement signal tracking.

**Key Features:**
- **3 Signal Stats**: Eligible (456), Outreach Stopped (1,889), Engagement Rate (19.4%).
- **Search + Project filter**: Filtered in real time using `useMemo`.
- **Bulk Actions bar**: Appears on row selection — "Add to Campaign" and "Delete" (UI only).
- **DataTable columns**: Avatar initials + gradient, Project pill, Engagement badge, Eligibility, Sent/Active dates.

**Lead Status Logic:**
```
'Opened'     → isEligible: true  → green Eligible badge
'Not Opened' → isEligible: false → outreach stopped
'Pending'    → first email not sent yet
```

---

### 6.7 Campaigns
**Route:** `/dashboard/campaigns`  
**File:** `pages/Campaigns.jsx`

**Purpose:** High-level listing of all campaigns with performance metrics.

**DataTable Columns:** Campaign Name (links to detail), Status badge, Total Leads, Opened count, Stopped count, First Sent, Yield % (computed live).

---

### 6.8 CampaignCreate
**Route:** `/dashboard/campaigns/create`  
**File:** `pages/CampaignCreate.jsx` (370 lines)

**Purpose:** 3-step wizard to create a new outreach campaign.

**Steps:**
```
Step 1: Project & Content  →  Step 2: Select Audience  →  Step 3: Review & Send
```

| Step | What happens |
|---|---|
| **1** | Select project (required), set campaign name, optionally generate AI templates (2s spinner → 3 `TemplateCard` options) |
| **2** | Select leads from a DataTable (filtered to selected project). Count shown live. |
| **3** | Review summary — campaign details, project context, lead count, message preview. "Launch Campaign" submits. |

**State:**
```js
currentStep  // 1 | 2 | 3
formData     // { project, name, subject, emailContent, templateId, selectedRows }
genStatus    // 'idle' | 'generating' | 'completed'
```

---

### 6.9 CampaignDetail
**Route:** `/dashboard/campaigns/:id`  
**File:** `pages/CampaignDetail.jsx`

Detailed view of a single campaign's performance breakdown.

---

### 6.10 Sequences (Follow-Ups)
**Route:** `/dashboard/sequences`  
**File:** `pages/Sequences.jsx`

**Purpose:** Manage single-step follow-up sequences for campaigns.

**Core Rule Displayed:**
> Follow-ups are **only** sent to leads who gave an "Open" signal. All non-responsive leads are discarded automatically.

**UI Elements:**
- Dark "Automated Logic Enabled" banner.
- Cards per sequence: Campaign name, Status, Eligible, Sent, Conversion yield.
- Blue info box: "Why only one follow-up?" — explains domain health philosophy.

---

### 6.11 Analytics
**Route:** `/dashboard/analytics`  
**File:** `pages/Analytics.jsx`

**Purpose:** Funnel performance analysis and AI optimization.

**Sections:**
| Section | Description |
|---|---|
| Signal Overview | 3 stats: Avg. Open Signal (19.4%), Auto-Stop Efficiency (80.6%), Follow-up Yield (7.2%) |
| Campaign Engagement Table | Initial Sent → Engaged % → Ignored % → Follow-up → Final Reply Yield |
| AI Optimization Insights | `OptimizationInsights` component |
| Auto-Stop Decision Log | Domain health, blocked follow-ups (2,635), sentiment protection |
| Yield Trend | Signal Pickup (78%) and Conversion Velocity (42%) progress bars |

---

### 6.12 Settings
**Route:** `/dashboard/settings`  
**File:** `pages/Settings.jsx`

Two-tab sidebar layout:

| Tab | Content |
|---|---|
| **User Profile** | Full Name, Primary Email, Organization — with "Update Identity" button |
| **Inboxes** | Connected Gmail (Google OAuth UI), "Connect New Inbox" button, Domain Health Tip |

---

## 7. UI Component Library

All reusable components live in `src/components/ui/`.

### `Badge.jsx`
Status chips. Variants: `primary` (indigo), `success` (emerald), `danger` (red), `info` (blue), `default` (slate).

### `Button.jsx`
`primary` (indigo fill) · `outline` (border) · `danger` (red fill). Props: `disabled`, `onClick`, `className` override.

### `Card.jsx`
White wrapper with rounded corners, border, shadow.

### `Input.jsx`
Labeled form input. Props: `label`, `type`, `value`, `onChange`, `placeholder`. Consistent `bg-slate-50 border rounded-2xl` styling.

### `Modal.jsx`
Accessible dialog. Props: `isOpen`, `onClose`, `title`, `size` (`sm | md | lg | xl`), `footer` (JSX slot). Renders backdrop + centered white card.

### `TitleComponent`
Typography normalization. Props: `type` (h1–h6, p), `size`, `className`. Applies `font-idGrotesk` for headings.

### `TemplateCard.jsx`
AI email template card: title, tone badge, CTA type, predicted open rate, subject, body preview. Has selected state (indigo ring + scale).

### `PersonaCard.jsx`
Displays an AI-generated lead persona.

### `AIAnalysisCard.jsx`
AI product intelligence widget for ProjectDetail's Overview tab.

### `LeadSourcingModal.jsx`
Modal for AI lead sourcing. Accepts persona config → fires `onGenerate` callback.

### `ABTestResults.jsx`
Side-by-side A/B template performance comparison widget.

### `OptimizationInsights.jsx`
AI-generated campaign optimization suggestions. Used in Analytics page.

### `ScalingVisualization.jsx`
Projected scaling impact visual metrics.

---

## 8. Google Maps Lead Import Module

The most complex feature — a multi-phase, multi-component system for importing local business leads.

### Component Tree
```
ProjectDetail.jsx
  └── GoogleMapsImportModal.jsx          (orchestrator — 350+ lines)
        ├── StepIndicator                (inline)
        ├── SearchErrorBanner            (inline — error states)
        ├── EmptyResultsState            (inline — empty results)
        ├── ShimmerRow                   (inline — loading skeleton)
        ├── ImportSummaryBar             (inline — selection metrics)
        └── GooglePlacesResultsTable.jsx
              └── EmailExtractionCell.jsx
  └── ImportSuccessToast.jsx             (fixed portal — bottom-right)
```

### Data Flow
```
User fills form → handleSearch()
                      ↓ random roll
            error / empty / success
                      ↓ success
         results = mockGooglePlacesResults (sliced to limit)
                      ↓
         GooglePlacesResultsTable renders
                      ↓
         User clicks "Extract Email" on a row
         handleExtractEmail(placeId)
           emailStates[id] = { status: 'loading' }
           → 1500ms timeout →
           emailStates[id] = { status: 'done', email: 'info@...' }
                      ↓
         User selects rows → "Add N Leads to Project" activates
         handleAddToProject() builds lead objects → calls onAddLeads()
         handleClose() resets all modal state
                      ↓
ProjectDetail: setProjectLeads(prev => [...prev, ...newLeads])
ProjectDetail: setImportToast({ count })
useEffect: auto-dismiss toast after 4000ms
```

### Error Simulation (Phase 5)
```
Math.random() per search:
  < 0.10  → 'quota_exceeded' (amber banner + retry)
  < 0.20  → 'api_error'      (red banner + retry)
  < 0.25  → empty results    (EmptyResultsState)
  ≥ 0.25  → normal success
```

### Email Extraction States
```
idle     →  "@ Extract Email" button
loading  →  amber spinner (1500ms)
done     →  "✓ info@company.com" green chip
no-site  →  "🚫 No Website" grey badge (disabled)
```

### Mock Data File
`src/data/mockGooglePlacesResults.js` — 20 business records:
`{ id, name, address, rating, reviews, phone, website, category, hours }`

---

## 9. State Management Strategy

React built-in hooks only — no Redux, Zustand, or Context.

| Pattern | Location | Purpose |
|---|---|---|
| `useState` | All pages/components | UI state, form data, modal visibility |
| `useMemo` | DataTable columns, filtered lists | Memoize expensive derivations |
| `useEffect` | Projects (persistence), ProjectDetail (toast dismiss) | localStorage sync, setTimeout cleanup |
| `useNavigate` | Dashboard, CampaignCreate | Programmatic navigation |
| `useParams` | ProjectDetail, CampaignDetail | Read `:id` from URL |
| **State Hoisting** | GoogleMapsImportModal → ProjectDetail | Modal emits leads upward via `onAddLeads` prop |
| **localStorage** | Projects.jsx | `cortex_projects` key — persists across reloads |

---

## 10. Data Layer

CortexReach is a **frontend-only prototype**. All data is:
1. Hard-coded mock arrays inside component files.
2. `localStorage` for projects (semi-persistent CRUD).
3. Simulated async via `setTimeout` for search, email extraction, and AI template generation.

### Mock Data Locations
| Data | File | Records |
|---|---|---|
| Google Places | `src/data/mockGooglePlacesResults.js` | 20 businesses |
| Dashboard stats/campaigns | `pages/Dashboard.jsx` | 4 stats, 4 campaigns |
| Global leads | `pages/Leads.jsx` | 5 leads |
| AI-generated leads | `pages/ProjectDetail.jsx` | 6 |
| Projects (default) | `pages/Projects.jsx` → localStorage | 3 |
| Campaigns | `pages/Campaigns.jsx` | 3 |
| Analytics | `pages/Analytics.jsx` | 3 campaign records |
| Sequences | `pages/Sequences.jsx` | 2 follow-ups |

### API Readiness
Every `setTimeout` simulation maps directly to a real API call:
1. Replace `setTimeout(() => { ... }, 2000)` with `await fetch('/api/...')`.
2. The surrounding state machine (`isLoading`, `searchError`, `results`) needs **zero changes**.
3. `projectLeads` schema already matches a production lead database model.

---

## 11. Design System

### Color Semantics
| Color | Tailwind Class | Role |
|---|---|---|
| Deep dark | `slate-900` | Primary text, dark panels |
| Light surface | `slate-50/100` | Card backgrounds, borders |
| Primary CTA | `indigo-600` | Buttons, active states, AI features |
| Google Maps | `emerald-600` | Import success, Maps source badge |
| Warning | `amber-500` | Quota errors, hint strips |
| Danger | `red-500` | API errors, delete actions |

### Typography
- **Headings**: `font-idGrotesk` (custom loaded from `src/fonts/`)
- **Labels**: `text-[10px] font-black uppercase tracking-widest` — used universally for section labels
- **Body**: System sans via Tailwind base

### Border Radius Scale
| Level | Class | Used For |
|---|---|---|
| Small | `rounded-xl` | Buttons, chips, tags |
| Medium | `rounded-2xl` | Inputs, small cards |
| Large | `rounded-3xl` | Page sections, table wrappers |
| X-Large | `rounded-[40px]` | Primary content panels |

### Animation Vocabulary
All transitions use Tailwind `animate-in` utilities:
```css
fade-in slide-in-from-bottom-4  /* page tab transitions */
fade-in zoom-in-95              /* modals, result tables */
fade-in slide-in-from-top-2     /* error banners */
fade-in slide-in-from-bottom-4  /* success toast */
```

### DataTable Style Pattern (reused across all pages)
```js
const customStyles = {
  table: { style: { backgroundColor: 'transparent' } },
  headRow: { style: { backgroundColor: '#f8fafc', minHeight: '52px' } },
  headCells: { style: { color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' } },
  rows: { style: { minHeight: '64px' } }
}
```

---

## 12. Core Business Rules

These rules are explicitly documented in code comments (`/** Product Rule: ... */`) across all files:

| Rule | Where Enforced |
|---|---|
| Initial email sent **once** per lead | Dashboard.jsx comment, Sequences.jsx |
| Follow-up **only** if lead opened first email | Sequences.jsx, Leads.jsx (`isEligible` field) |
| Leads must be linked to a **Project** | CampaignCreate.jsx Step 1 gate, Leads.jsx comment |
| Campaigns must be **project-scoped** | CampaignCreate.jsx project selector (required before proceeding) |
| Maximum **one follow-up** step | Sequences.jsx explanation card |
| **Auto-stop** for non-responsive leads | Dashboard stats, Analytics "Auto-Stop Decision Log" |

---

*Documentation generated from full source code analysis — CortexReach v1.0, 2026-02-19*
