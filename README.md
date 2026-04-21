# CortexReach - AI-Powered Cold Email Outreach Platform

A premium, engagement-based cold email outreach platform built with React, Tailwind CSS, and Firebase. CortexReach enables businesses to scout leads, manage projects, and launch automated outreach campaigns with a focus on high-intent signals.

## 🚀 Project Overview

CortexReach is a comprehensive dashboard application designed to streamline the cold email outreach process. Unlike traditional trackers, it focuses on **engagement signals** to help users identify the most promising leads.

### Key Features:
- **Lead Intelligence**: Scout and manage high-intent leads tailored to specific projects.
- **Campaign Decision Engine**: Launch and track campaigns with a focus on "Yield" and "Eligibility".
- **AI-Driven Personalization**: Leverages project data to generate targeted outreach content.
- **Premium Glassmorphic UI**: A state-of-the-art interface built for professional SaaS experiences.
- **Firebase Integration**: Real-time data persistence for authentication and database management.

## 🛠️ Tech Stack

- **React 19** - Modern UI development
- **Firebase** - Authentication and Realtime Database
- **Tailwind CSS v3** - Utility-first styling with custom glassmorphism
- **React Router 7** - Client-side routing
- **Font Awesome 6** - Comprehensive icon system
- **React Hot Toast** - Elegant notification system
- **Vite** - High-speed build tool and development server

## 📁 Core Project Structure

```
CortexReach/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── appLayout/          # Main dashboard shell
│   │   │   ├── sidebar/             # Enhanced navigation sidebar (300px/w-72)
│   │   │   └── header/              # Sticky top header with global actions
│   │   ├── ui/                       # Atomic design components (Badge, Button, Input, Modal, etc.)
│   │   ├── titleComponent/           # Standardized typography system
│   │   └── campaigns/                # Campaign-specific specialized components
│   ├── pages/                        # Feature-rich page components (PascalCasePage.jsx)
│   │   ├── dashboard-page.jsx        # Signal-focused overview
│   │   ├── leads-page.jsx            # Advanced lead management & importing
│   │   ├── campaigns-page.jsx        # Outreach execution hub
│   │   ├── templates-page.jsx        # Script library and management
│   │   └── settings-page.jsx         # Global configuration
│   ├── services/                     # Business logic & Firebase DB adapters
│   ├── config/                       # Environment & Firebase configuration
│   ├── context/                      # Global state (Auth, UI)
│   └── index.css                     # Global styles and design tokens
```

## 🎨 Design System: "Aura Premium"

CortexReach follows a strict design protocol documented in `GUIDELINES.md`, prioritizing high-end aesthetics and user flow efficiency.

### Visual Tokens:
- **Glassmorphism**: Extensive use of `bg-surface/80` with `backdrop-blur-xl`.
- **Gradients**: `bg-gradient-brand` (a deep indigo to light purple blend) for primary headers and actions.
- **Radii**: Standardized `rounded-2xl` for containers and `rounded-xl` for interactive elements.
- **Typography**: Custom **ID Grotesk** font family for a bold, modern professional look.
- **Shadows**: Custom `shadow-premium` for depth and `shadow-brand` for active brand elements.

## 📄 Featured Pages

### 1. Outreach Signals (Dashboard)
Focuses on conversion signals rather than just raw volume. Tracks "Eligible for Follow-up" vs "Outreach Stopped" based on engagement.

### 2. Lead Decisions (Leads)
Project-centric lead management. Import CSV/XLSX leads into specific projects to keep your outreach targeted and organized.

### 3. Campaigns Hub
Execute engagement campaigns. Tracks "Yield" metrics—the percentage of sent emails that converted into eligible leads.

### 4. Templates Library
Manage your scripts with a built-in library of high-performing outreach presets, fully editable via a custom editor.

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Firebase Project (for Auth and Realtime Database)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CortexReach
```

2. **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. **Install & Run**
```bash
npm install
npx vercel dev
```

The application will be available at `http://localhost:3000/`

## 📝 Coding Standards

- **File Naming**: `kebab-case-page.jsx` for pages, `camelCase.jsx` for utility components.
- **Component Export**: Always use default exports with `PascalCasePage` or `PascalCase` naming.
- **Styling**: Strictly use Tailwind CSS utility classes and design tokens. Avoid arbitrary values where tokens exist.
- **Responsiveness**: Mobile-first design for components, large-screen optimization for layouts.

---

**Built with ❤️ by Antigravity for the next generation of outreach.**
