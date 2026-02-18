# CortexReach System Architecture Documentation

This document provides a comprehensive overview of the technical architecture and design patterns used in the **CortexReach** Cold Email Outreach platform.

---

## 1. High-Level Architecture
CortexReach is built as a **Single Page Application (SPA)** using a modular, component-based architecture. It prioritizes a premium user experience through modern UI/UX patterns.

### Core Technologies
- **UI Framework**: React 19 (Functional Components & Hooks)
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3 (Utility-first) & Vanilla CSS for animations
- **Iconography**: Font Awesome 7
- **State Management**: React `useState`/`useContext` & Browser `localStorage`

---

## 2. Routing & Navigation Structure
The application uses a **Nested Routing** strategy to separate public authentication from protected dashboard content.

### Route Mapping
- **`/` (Root)**: `SignIn.jsx` - The entry point for the application.
- **`/dashboard`**: `AppLayout.jsx` - Main dashboard wrapper containing:
  - **`/dashboard/`**: `Dashboard.jsx` (Overview)
  - **`/dashboard/projects`**: `Projects.jsx` (List & Management)
  - **`/dashboard/leads`**: `Leads.jsx`
  - **`/dashboard/campaigns`**: `Campaigns.jsx`
  - **`/dashboard/settings`**: `Settings.jsx`
- **`*` (Fallback)**: Redirects all unknown paths to the Sign-In page.

---

## 3. Persistent Layout System
The system utilizes a central `AppLayout` component to maintain a consistent UI across all dashboard pages.

### Components
1. **Sidebar (`Sidebar.jsx`)**:
   - Persistent left navigation.
   - Nested menu items with active state detection using `NavLink`.
   - **Account Dropdown**: An upward-opening menu at the bottom containing user settings and Sign Out functionality.
2. **Header (`Header.jsx`)**:
   - Dynamic **Notification System**: A relative-positioned dropdown that displays real-time outreach signals.
   - **Profile Workspace**: Displays logged-in user details (Avatar, Name, Designation).
   - Global search bar and notification badge.

---

## 4. Authentication & Session Management
CortexReach implements a simulated authentication layer to demonstrate secure workflows.

### Flow
1. **Validation**: User enters credentials (`admin`/`123`).
2. **Persistence**: Upon successful login, user metadata is stored in `localStorage` (`cortex_user`).
3. **Session Recovery**: The application reads from `localStorage` to populate the UI with the user's name and avatar.
4. **Teardown**: The "Sign Out" action clears `localStorage` and redirects the user to the root `/`.

---

## 5. UI/UX Design System
The architecture follows a "Premium Modern SaaS" design language.

### Design Patterns
- **Glassmorphism**: Use of `backdrop-blur`, semi-transparent backgrounds, and subtle borders to create depth.
- **Micro-Animations**: 
  - `animate-float`: Floating icons for a dynamic feel.
  - `animate-pulse`: Soft background glow effects.
  - `animate-shimmer`: Loading states and hover effects.
- **Responsiveness**: Fluid layout using Tailwind's grid and flexbox, with a dedicated mobile hamburger menu.

---

## 6. Component Communication
Data flows through the system using standard React patterns:
- **Props**: Passing configuration and state down to UI components (`Button`, `Badge`, `Card`).
- **State Lifting**: Managing common UI states (like Sidebar open/close) in the layout parent.
- **Event Handlers**: Centralizing logic for modals and dropdowns to ensure consistent behavior.

---

## 7. Future Scalability
The architecture is designed to easily integrate with a backend API:
- **API Nodes**: Ready to replace `localStorage` with JWT/Session cookies.
- **Context API**: Pre-structured for migrating to a global `AuthContext` or `NotificationContext`.
- **Dynamic Imports**: Routes can be lazy-loaded to optimize performance as the project grows.

---
*Last Updated: February 2026*
