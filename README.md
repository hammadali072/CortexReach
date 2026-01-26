# CortexReach - Cold Email Outreach Platform

A modern, engagement-based cold email outreach platform built with React, Tailwind CSS, and Font Awesome icons.

## 🚀 Project Overview

CortexReach is a **frontend-only** UI implementation designed for managing cold email campaigns. This project provides a complete dashboard interface with:

- Lead management and scraping workflows
- Campaign creation and tracking
- Engagement-based follow-up sequences
- Analytics and performance metrics
- User settings and preferences

**Note:** This is purely a UI implementation. Backend logic, APIs, and integrations are out of scope.

## 🛠️ Tech Stack

- **React 19.2.0** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS v3** - Utility-first styling
- **Font Awesome** - Icon library
- **Vite** - Build tool and dev server
- **clsx** - Conditional class management

## 📁 Project Structure

```
CortexReach/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       # Main layout wrapper
│   │   │   ├── Sidebar.jsx         # Left navigation sidebar
│   │   │   └── Header.jsx          # Top header bar
│   │   ├── ui/
│   │   │   ├── Card.jsx            # Reusable card component
│   │   │   ├── Button.jsx          # Button with variants
│   │   │   ├── Badge.jsx           # Status badges
│   │   │   └── Input.jsx           # Form input component
│   │   └── titleComponent/
│   │       └── titleComponent.jsx   # Typography system
│   ├── pages/
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── Leads.jsx               # Lead management
│   │   ├── Campaigns.jsx           # Campaign list
│   │   ├── CampaignCreate.jsx      # Multi-step campaign creation
│   │   ├── Sequences.jsx           # Email sequences
│   │   ├── Analytics.jsx           # Performance analytics
│   │   └── Settings.jsx            # User settings
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # App entry point
│   └── index.css                   # Global styles + Tailwind
├── tailwind.config.js              # Tailwind configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🎨 Design System

### Colors
The application uses Tailwind's default color palette with semantic usage:
- **Primary (Blue)**: Main actions, active states
- **Success (Green)**: Positive metrics, completed states
- **Warning (Yellow)**: Alerts, paused states
- **Danger (Red)**: Errors, delete actions
- **Gray**: Text, borders, backgrounds

### Typography
The app uses the custom **ID Grotesk** font family with a comprehensive typography system via `TitleComponent`:

**Headings:**
- `h1` - Hero headings (2xl-7xl responsive)
- `h2` - Page titles (2xl-44px responsive)
- `h3` - Section headings (xl-4xl responsive)
- `h4` - Card titles (lg-2xl responsive)
- `h5` - Small headings (base-xl responsive)
- `h6` - Tiny headings (base-lg responsive)

**Paragraphs:**
Available in sizes: `extra-small`, `small`, `base`, `large`, `extra-large`
Each with weight variants: normal, medium, semibold, bold

### Components

#### Card
```jsx
<Card padding="default" className="">
  {children}
</Card>
```
Padding options: `none`, `small`, `default`, `large`

#### Button
```jsx
<Button variant="primary" size="medium" onClick={handler}>
  Click Me
</Button>
```
Variants: `primary`, `secondary`, `outline`, `danger`, `success`
Sizes: `small`, `medium`, `large`

#### Badge
```jsx
<Badge variant="success">Active</Badge>
```
Variants: `default`, `primary`, `success`, `warning`, `danger`, `info`

#### Input
```jsx
<Input 
  label="Email"
  type="email"
  placeholder="Enter email"
  value={value}
  onChange={handleChange}
  error={error}
  required
/>
```

## 📄 Pages Overview

### 1. Dashboard (`/`)
- Overview statistics (leads, emails sent, open rate, campaigns)
- Recent campaigns table
- Quick action cards

### 2. Leads (`/leads`)
- Lead table with search and filters
- Status indicators (New, Opened, Ignored)
- Tag management
- Bulk actions (import, export)

### 3. Campaigns (`/campaigns`)
- Campaign list with status badges
- Performance metrics per campaign
- Create new campaign button
- Progress bars showing open/reply rates

### 4. Campaign Creation (`/campaigns/create`)
Multi-step wizard:
1. **Campaign Details** - Name and subject line
2. **Email Content** - Rich text editor placeholder
3. **Select Audience** - Lead selection table
4. **Review & Send** - Final review before sending

### 5. Sequences (`/sequences`)
- Automated email workflow management
- Enrollment and completion tracking
- Step-by-step sequence builder (UI only)

### 6. Analytics (`/analytics`)
- Performance overview stats
- Engagement charts (placeholder)
- Top performing campaigns
- Detailed metrics table

### 7. Settings (`/settings`)
Tabbed interface with:
- **Profile** - User information
- **Email Settings** - Sending preferences, tracking options
- **Notifications** - Email notification preferences
- **API Keys** - API key management (placeholder)

## 🎯 Key Features

### Responsive Design
- Desktop-first approach
- Mobile-friendly sidebar (hamburger menu)
- Responsive tables and grids
- Breakpoints: sm, md, lg, xl, 2xl

### Clean UI Principles
- Minimal, modern SaaS aesthetic
- Clear visual hierarchy
- Consistent spacing (Tailwind's spacing scale)
- Accessible color contrast
- No flashy animations (subtle transitions only)

### Reusability
- All UI components are reusable
- Consistent prop interfaces
- No inline styles
- Shared layout system

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CortexReach
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Code Conventions

### Component Structure
```jsx
import PropTypes from 'prop-types'
import clsx from 'clsx'

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  )
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func
}

export default ComponentName
```

### Naming Conventions
- Components: PascalCase (`Dashboard.jsx`)
- Functions: camelCase (`handleSubmit`)
- CSS classes: Tailwind utilities
- Props: camelCase

### Comments
Comments indicate where backend integration would occur:
```jsx
// TODO: Connect to backend API
// TODO: Replace with actual chart library
```

## 🔌 Backend Integration Points

When connecting to a backend, you'll need to:

1. **Replace placeholder data** with API calls in:
   - Dashboard stats
   - Leads table
   - Campaigns list
   - Analytics metrics

2. **Implement form submissions** in:
   - Campaign creation flow
   - Lead import
   - Settings updates

3. **Add authentication**:
   - Login/logout functionality
   - Protected routes
   - User session management

4. **Integrate real-time updates** for:
   - Email engagement tracking
   - Campaign status changes
   - New lead notifications

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js` to customize the color palette:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Adding Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/layout/Sidebar.jsx`

### Custom Components
Add new reusable components to `src/components/ui/`

## 📚 Dependencies

### Production
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `react-router-dom`: ^7.x.x
- `@fortawesome/fontawesome-free`: ^6.x.x
- `clsx`: ^2.1.1
- `prop-types`: ^15.8.1

### Development
- `vite`: ^7.2.4
- `tailwindcss`: ^3.4.19
- `autoprefixer`: ^10.4.23
- `postcss`: ^8.5.6
- ESLint plugins

## 🐛 Known Issues

- Charts in Analytics are placeholders (needs library integration)
- Rich text editor in Campaign Creation is a textarea (needs proper WYSIWYG)
- API key management is UI only
- No actual data persistence

## 🔮 Future Enhancements

When implementing the backend, consider:
- Real-time WebSocket connections for engagement tracking
- Chart library integration (Chart.js, Recharts, or Visx)
- Rich text editor (TipTap, Quill, or Draft.js)
- CSV import/export functionality
- Email template builder
- A/B testing for campaigns
- Team collaboration features
- Advanced filtering and search

## 📄 License

[Add your license here]

## 👨‍💻 Developer Notes

### State Management
Currently uses local component state with `useState`. For production, consider:
- Context API for global state
- Redux Toolkit for complex state
- TanStack Query (React Query) for server state

### Form Handling
Consider integrating:
- React Hook Form for form validation
- Yup or Zod for schema validation

### Testing
Add testing with:
- Vitest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

---

**Built with ❤️ for CortexReach**
