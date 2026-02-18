# CortexReach System Architecture Documentation (AI-Driven Upgrade)

This document details the modular, AI-first architecture of **CortexReach**, following the implementation of the advanced outreach workflow (Phases 1-6).

---

## 1. High-Level Architecture
CortexReach is a **Single Page Application (SPA)** utilizing a "Component-as-a-Service" UI philosophy. The architecture is designed to simulate complex AI operations through high-fidelity, interactive UI modules.

### Core Stack
- **Framework**: React 19 (Hooks-driven state)
- **Styling**: Tailwind CSS 3 (Utility-first)
- **Routing**: React Router DOM 7
- **Design System**: Custom B2B SaaS system featuring Glassmorphism, Micro-animations, and AI-specific Indigo tokens.

---

## 2. Updated Routing & Page Map
The application uses a hybrid routing system that separates core dashboard functions from detailed intelligence views.

- **`/`**: Authentication Entry (`SignIn.jsx`).
- **`/dashboard`**: Core Workspace (`AppLayout.jsx`).
  - **`/dashboard/`**: Engagement Overview (`Dashboard.jsx`).
  - **`/dashboard/projects/:id`**: **Project Intelligence Command** (Houses AI Analysis).
  - **`/dashboard/campaigns`**: Outreach Portfolio.
  - **`/dashboard/campaigns/:id`**: **Campaign Performance Center** (Houses A/B Tests & Scaling).
  - **`/dashboard/campaigns/create`**: **AI Content Factory** (Houses Template Generator).
  - **`/dashboard/analytics`**: **Optimization Hub** (Houses AI Insights).

---

## 3. The AI Intelligence Workflow (Modular Architecture)
The system is divided into functional AI modules that can be reused across different project contexts.

### Phase 1: Product Intelligence
- **Module**: `AIAnalysisCard.jsx`
- **Logic**: Simulates product-market fit analysis using the project's scope.
- **Sub-Components**: `PersonaCard.jsx` for targeted individual profiles.

### Phase 2: Signal Sourcing
- **Module**: `LeadSourcingModal.jsx`
- **Logic**: Parameter-driven lead hunting simulation.
- **UI Element**: `aiColumns` in `DataTable` featuring the **Relevance Score Gradient**.

### Phase 3: Content Factory
- **Module**: `TemplateCard.jsx`
- **Logic**: Multi-model drafting (Executive, Growth, Direct) with built-in performance prediction.
- **Integration**: Injected into `CampaignCreate.jsx` to replace manual entry.

### Phase 4 & 6: Strategic Scaling
- **Modules**: `ABTestResults.jsx`, `ScalingVisualization.jsx`
- **Logic**: Compares engagement signals from initial batches and visualizes the automated scaling of winning models.
- **Context**: Located in `CampaignDetail.jsx`.

### Phase 5: Feedback Loop
- **Module**: `OptimizationInsights.jsx`
- **Logic**: Generates prioritized "Confidence-based" recommendations to improve campaign yield.
- **Context**: Located in `Analytics.jsx`.

---

## 4. UI/UX & Interaction Layer
The architecture employs specific visual strategies to communicate AI activity to the user:

- **Stateful Intelligence**: Components use local `status` hooks (`idle` | `analyzing` | `completed`) to manage complex UI transitions.
- **Visual Cues**: 
  - **Indigo/Sparkles**: Universal identifier for AI-driven elements.
  - **Shimmer Effects**: Custom `@keyframes` that signify real-time data processing without backend latency.
  - **Tactile Scaling**: Progress bars with staggered `duration` and `delay` to simulate authentic data ingestion.

---

## 5. Data & Persistence Model
- **Mock Service Layer**: Comprehensive arrays (`mockPersonas`, `mockTemplates`, `mockGeneratedLeads`) serve as the source of truth.
- **Simulated Filtering**: Heavy use of `useMemo` for client-side filtering (e.g., `relevanceFilter`, `personaFilter`) to ensure interface speed.
- **Session Persistence**: Critical project data persists in `localStorage`, allowing for seamless transitions between analysis and creation.

---

## 6. Future Integration Strategy
The architecture is "Backend-Ready" through explicit integration points:
1. **API Swap**: Replace mock arrays with `Async/Await` fetch calls to REST/GraphQL endpoints.
2. **WebSocket Support**: Ready to move from `setTimeout` simulations to real-time events for lead sourcing.
3. **Global AI Store**: Transition from local state to `Zustand` or `Redux` to synchronize AI insights across the entire workspace.

---
*Last Updated: February 2026*
