# CortexReach - Project Structure & Implementation Guide

## 📋 Complete Component Inventory

### Layout Components

#### 1. AppLayout.jsx
**Location:** `src/components/layout/AppLayout.jsx`
**Purpose:** Main application shell that combines sidebar, header, and content area
**Features:**
- Manages sidebar open/close state for mobile
- Uses React Router's `<Outlet />` for nested routes
- Responsive layout with flexible content area

**Usage:**
```jsx
<Route path="/" element={<AppLayout />}>
  <Route index element={<Dashboard />} />
  {/* Other routes */}
</Route>
```

---

#### 2. Sidebar.jsx
**Location:** `src/components/layout/Sidebar.jsx`
**Purpose:** Left navigation sidebar with menu items
**Features:**
- Brand logo with icon
- Navigation menu items with active states
- User profile section at bottom
- Mobile overlay and close button
- Responsive (fixed on mobile, sticky on desktop)

**Navigation Items:**
- Dashboard (`/`)
- Leads (`/leads`)
- Campaigns (`/campaigns`)
- Sequences (`/sequences`)
- Analytics (`/analytics`)
- Settings (`/settings`)

---

#### 3. Header.jsx
**Location:** `src/components/layout/Header.jsx`
**Purpose:** Top header bar with search and actions
**Features:**
- Mobile menu toggle button
- Global search bar (desktop only)
- Notifications bell with badge
- User profile dropdown placeholder

---

### UI Components

#### 4. Card.jsx
**Location:** `src/components/ui/Card.jsx`
**Props:**
- `children` (required): Content to display
- `className`: Additional CSS classes
- `padding`: 'none' | 'small' | 'default' | 'large'

**Usage:**
```jsx
<Card padding="default" className="hover:shadow-lg">
  <h1>Card Title</h1>
  <p>Card content</p>
</Card>
```

---

#### 5. Button.jsx
**Location:** `src/components/ui/Button.jsx`
**Props:**
- `children` (required): Button text/content
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
- `size`: 'small' | 'medium' | 'large'
- `onClick`: Click handler function
- `disabled`: Boolean
- `type`: 'button' | 'submit' | 'reset'
- `className`: Additional CSS classes

**Usage:**
```jsx
<Button variant="primary" size="medium" onClick={handleClick}>
  <i className="fas fa-plus mr-2"></i>
  Create Campaign
</Button>
```

---

#### 6. Badge.jsx
**Location:** `src/components/ui/Badge.jsx`
**Props:**
- `children` (required): Badge text
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
- `className`: Additional CSS classes

**Usage:**
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Paused</Badge>
<Badge variant="default">Draft</Badge>
```

---

#### 7. Input.jsx
**Location:** `src/components/ui/Input.jsx`
**Props:**
- `type`: Input type (default: 'text')
- `label`: Label text
- `placeholder`: Placeholder text
- `value`: Controlled input value
- `onChange`: Change handler
- `error`: Error message string
- `required`: Boolean
- `disabled`: Boolean
- `className`: Additional CSS classes

**Usage:**
```jsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

---

#### 8. TitleComponent.jsx (Existing)
**Location:** `src/components/titleComponent/titleComponent.jsx`
**Props:**
- `type`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
- `size`: Typography size (for paragraphs)
- `children` (required): Text content
- `className`: Additional CSS classes

**Usage:**
```jsx
<TitleComponent type="h2" className="text-gray-800">
  Page Title
</TitleComponent>

<TitleComponent type="p" size="base-medium" className="text-gray-600">
  Subtitle text
</TitleComponent>
```

---

## 📄 Page Components

### 1. Dashboard.jsx
**Route:** `/`
**Features:**
- 4 stat cards (Total Leads, Emails Sent, Open Rate, Active Campaigns)
- Recent campaigns table
- 3 quick action cards
- Color-coded icons for visual appeal

**Placeholder Data:**
- `stats`: Array of metric objects
- `recentCampaigns`: Array of campaign objects

---

### 2. Leads.jsx
**Route:** `/leads`
**Features:**
- Search input for filtering leads
- Status dropdown filter
- Filter and export buttons
- Leads table with:
  - Checkbox selection
  - Name and email
  - Company and position
  - Status badge
  - Tags
  - Action buttons (view, edit, delete)
- Pagination controls

**Placeholder Data:**
- `leads`: Array of lead objects with status, tags, etc.

---

### 3. Campaigns.jsx
**Route:** `/campaigns`
**Features:**
- Stats summary (total, active, drafts, completed)
- Campaign cards showing:
  - Name and status badge
  - Subject line
  - Recipients, sent, opened, replied metrics
  - Progress bar for open/reply rates
- Create campaign button
- Empty state message

**Placeholder Data:**
- `campaigns`: Array of campaign objects

---

### 4. CampaignCreate.jsx
**Route:** `/campaigns/create`
**Features:**
Multi-step wizard with progress indicator:

**Step 1: Campaign Details**
- Campaign name input
- Email subject input
- Description textarea

**Step 2: Email Content**
- Toolbar placeholder (bold, italic, list, link)
- Email body textarea
- Variable placeholder hints ({{FirstName}}, {{Company}})

**Step 3: Select Audience**
- Select all checkbox
- Leads selection table with checkboxes
- Selected count display

**Step 4: Review & Send**
- Campaign details summary
- Email content preview
- Recipients count
- Warning message before sending

**Navigation:**
- Previous/Next buttons
- Save as draft button
- Send campaign button (final step)

**State Management:**
- `currentStep`: Tracks active step (1-4)
- `formData`: Stores all form inputs

---

### 5. Sequences.jsx
**Route:** `/sequences`
**Features:**
- Sequence cards showing:
  - Name, status badge, step count
  - Description
  - Enrolled and completed counts
  - Completion rate progress bar
- Info card explaining sequences
- Create sequence button

**Placeholder Data:**
- `sequences`: Array of sequence objects

---

### 6. Analytics.jsx
**Route:** `/analytics`
**Features:**
- Date range selector (dropdown)
- 4 overview stat cards with trend indicators
- Engagement chart (placeholder bar chart)
- Top performing campaigns list
- Detailed metrics table

**Placeholder Data:**
- `overviewStats`: Array of metric objects
- `topCampaigns`: Array with open/reply rates
- `engagementByDay`: Array for chart data

**TODO:** Integrate actual chart library (Chart.js, Recharts, etc.)

---

### 7. Settings.jsx
**Route:** `/settings`
**Features:**
Tab-based interface with 4 sections:

**Profile Tab:**
- Profile picture upload
- Name, email, company, phone inputs
- Save button

**Email Settings Tab:**
- Sending email address
- Sender name
- Daily send limit
- Track opens checkbox
- Track clicks checkbox

**Notifications Tab:**
- Email notifications toggle
- New replies toggle
- Campaign completed toggle
- Weekly reports toggle

**API Keys Tab:**
- Info message
- Generate new key button
- API key list with:
  - Masked key display
  - Creation and last used dates
  - Copy and delete buttons

**State Management:**
- `activeTab`: Tracks which tab is shown
- `profileData`: Stores profile form data

---

## 🎨 Design Patterns Used

### 1. Compound Components
The layout uses a compound component pattern:
```jsx
<AppLayout>
  <Outlet /> {/* Renders child routes */}
</AppLayout>
```

### 2. Controlled Components
All form inputs are controlled:
```jsx
<Input
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

### 3. Composition
Components are highly composable:
```jsx
<Card>
  <TitleComponent type="h4">Title</TitleComponent>
  <Button variant="primary">Action</Button>
</Card>
```

### 4. Prop Spreading
Used for flexibility in Input component:
```jsx
<Input {...props} />
```

---

## 🎯 Styling Approach

### Tailwind Utilities
All styling uses Tailwind CSS utility classes:
- No CSS modules
- No styled-components
- No inline styles
- Consistent with existing project setup

### Common Patterns

**Responsive Grid:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Hover Effects:**
```jsx
<div className="hover:shadow-md transition-shadow">
```

**Conditional Classes (using clsx):**
```jsx
className={clsx(
  'base-classes',
  condition && 'conditional-classes',
  variant === 'primary' ? 'primary-classes' : 'default-classes'
)}
```

---

## 🔄 Data Flow

### Current Implementation
```
Component State (useState)
    ↓
Props to children
    ↓
User interaction
    ↓
Update state
```

### Future Backend Integration
```
Page Component
    ↓
API Call (useEffect/TanStack Query)
    ↓
Loading/Error/Success states
    ↓
Render with real data
```

Example transformation:
```jsx
// Current
const [leads, setLeads] = useState(placeholderData)

// Future
const { data: leads, isLoading, error } = useQuery({
  queryKey: ['leads'],
  queryFn: fetchLeads
})
```

---

## 📝 Comments & TODO Markers

Throughout the code, you'll find comments like:
```jsx
// TODO: Connect to backend API
// TODO: Replace with actual form library
// TODO: Add chart library integration
```

These indicate where backend integration or library additions are needed.

---

## 🚀 Next Steps for Production

1. **State Management**
   - Add React Context for global state
   - Or integrate Redux Toolkit

2. **Form Handling**
   - Replace controlled inputs with React Hook Form
   - Add Yup or Zod validation schemas

3. **Data Fetching**
   - Integrate TanStack Query (React Query)
   - Create API client module
   - Add loading and error states

4. **Authentication**
   - Add login/signup pages
   - Implement protected routes
   - Add JWT token management

5. **Real Charts**
   - Install chart library (Recharts recommended)
   - Replace placeholder charts in Analytics

6. **Rich Text Editor**
   - Add TipTap or Quill
   - Replace textarea in Campaign Creation

7. **Advanced Features**
   - File upload for CSV imports
   - Export functionality
   - Drag-and-drop for sequences
   - Email template builder

---

## 🎓 Learning Resources

If you're new to any of these technologies:

- **React Router:** https://reactrouter.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Font Awesome:** https://fontawesome.com/icons
- **React Hook Form:** https://react-hook-form.com/
- **TanStack Query:** https://tanstack.com/query/

---

**Last Updated:** 2026-01-24
