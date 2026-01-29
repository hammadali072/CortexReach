# CortexReach Product Documentation: Functional Flow & Purpose

## 🔭 Product Core: The Engagement-First Model
CortexReach is architected around a strict "One-Signal" outreach philosophy. The core objective is to move leads from initial outreach to active conversation while minimizing automated follow-ups to non-responsive leads. This logic flows through every tab of the application, prioritizing lead quality and sender reputation over volume.

---

## 🧭 Dashboard: The Central Intelligence Unit
### Purpose
The Dashboard provides a consolidated view of the outreach ecosystem's efficiency. It serves as the starting point for daily operations, allowing users to assess the status of the "Engagement Funnel" at a glance.

### Functional Flow
- **Signal Monitoring**: Tracks the transition of "Initial Sent" leads to "Signal Detected" status.
- **Conversion Velocity**: Measures the speed at which engaged leads are moving toward a final reply.
- **Reputation Protection Metrics**: Displays the volume of automated outreach "saved" or "halted" by the system's decision logic, validating the engagement-first strategy.
- **Yield Trends**: Shows a 30-day performance curve of conversation retention.

---

## 👥 Lead Decisions: Signal Processing & Gating
### Purpose
This tab is the operational heart of lead management. It is where raw lead data is transformed into "Eligible Candidates" for further outreach based on their behavioral signals.

### Functional Flow
- **Engagement Categorization**: The system automatically labels leads as "Opened" (Detected) or "Not Opened" (Ignored).
- **Automated Gating**: Based on the detection signal, the system triggers an "Eligibility" status. Only "Opened" leads are allowed to bypass the automated halt.
- **Decision Filtering**: Users can sort and filter leads by their "Actionable Status" to identify who is ready for a follow-up.
- **Bulk Decisioning**: Users can manually intervene to "Add to Campaign" for those ready to proceed or "Ignore" to permanently prune them from the funnel.

---

## ✉️ Campaigns: The Outreach Portfolio
### Purpose
The Campaigns tab manages the lifecycle of initial outreach batches. It provides a comparative view of different strategies and their resulting signal yields.

### Functional Flow
- **Portfolio Management**: Lists all outreach batches (Active, Draft, Completed).
- **Yield Calculation**: For every campaign, the system displays the ratio of "Opened" vs. "Total Sent" to determine the effectiveness of the initial hook.
- **Halt Tracking**: Shows the specific count of "Stopped" leads per campaign, indicating where the funnel logic saved the user from potentially damaging their sender reputation.

---

## ➕ Create Outreach: The Strategic Wizard
### Purpose
A structured, 3-step procedural workflow for initiating new engagement-only outreach campaigns.

### Functional Flow
1. **Content Definition**: Establishing the campaign identifier and composing the high-intent initial message.
2. **Audience Selection**: Identifying target leads from the database.
3. **Reputation Review**: A final validation step where the system confirms the "Auto-Stop" logic is active, ensuring the user understands that outreach will halt for non-responders.

---

## 🔁 Follow-Ups: The Engagement Engine
### Purpose
Dedicated specifically to the secondary outreach stage. It manages the messages sent *only* to those leads who passed the initial signal gate.

### Functional Flow
- **Retention Management**: Tracks leads who are currently in the follow-up stage after demonstrating an initial open signal.
- **Contextual Sequences**: Manages the single-step follow-up logic, ensuring that high-intent leads receive the necessary nudge to reply.
- **Yield per Step**: Monitors how many "Eligible" leads actually convert into "Replies" during this stage.

---

## 📊 Yield Analytics: In-Depth Funnel Insights
### Purpose
Provides a scientific breakdown of the entire outreach funnel, allowing for strategy refinement based on data.

### Functional Flow
- **Funnel Performance Analysis**: Breaks down the journey from "Sent" -> "Engaged" -> "Retained" -> "Reply."
- **Decision Insights**: Logs the volume of "Blocked Follow-ups," providing proof of domain reputation protection.
- **Pickup vs. Velocity Analysis**: Compares the initial signal detection rate against the speed of final conversion.

---

## ⚙️ System Configuration: Identity & Connectivity
### Purpose
Manages the technical foundations required for outreach and signal detection.

### Functional Flow
- **Identity Management**: Defines the sender's professional profile and organizational context.
- **Connectivity Hub**: Manages the authorization of inboxes via OAuth, allowing the system to monitor incoming "Open" and "Reply" signals.
- **Health Advisories**: Provides contextual tips on maintaining high sender scores based on current connection status.

---
*Document Version: 1.2*  
*Focus: Functional Operations & Tab Flow*
