# agent.md – Grow Fitness

## 1. Overview

**Project Name:** Grow Fitness
**Agent Name:** Grow Fitness Platform Agent

**Description:**
The Grow Fitness Platform Agent manages user roles, registrations, sessions, dashboards, and communications across the Grow Fitness Kids Gym Activity System. It coordinates workflows between Admin, Coach, Parent, and Kid profiles across two portals: **Admin Portal** and **Client Portal**.

**Type:**
System Orchestration Agent (Business Logic & Workflow Agent)

---

## 2. Core Roles & Portals

### Roles

* **Admin** – Full system control and management
* **Coach** – Manages sessions, activities, and milestones
* **Parent** – Manages kids, sessions, and payments
* **Kid** – Receives sessions, milestones, and achievements

### Portals

* **Admin Portal** – Used only by Admin
* **Client Portal** – Used by Coaches and Parents

---

## 3. Responsibilities

The agent is responsible for:

* Role-based authentication and authorization
* Managing separate profiles for Admin, Coach, Parent, and Kid
* Handling multiple registration flows
* Session scheduling and approval workflows
* Dashboard data orchestration per role
* Notification triggers (WhatsApp / Email)
* Invoice and payment visibility

---

## 4. Registration & Onboarding Workflows

### 4.1 Coach Registration (Admin Only)

* Coach registration form available only in Admin Portal
* Admin creates coach profile
* Coach receives login credentials
* Coach logs in via Client Portal

---

### 4.2 Parent – Free Session (Outsider Flow)

**Purpose:** Allow non-registered parents to book one free session

**Input Fields:**

* Parent name
* Phone number
* Email
* Kid name
* Session type (Individual / Group)
* Select session

**Behavior:**

* Does NOT create a parent or kid account
* If slots are full, parent is added to the waiting list
* Submission appears in Admin Portal under *Free Session Kids List*
* Admin selects kids and sends session details via WhatsApp / Email
* Kids not selected are auto-added to the next free session

---

### 4.3 Parent – Full Registration (Client or Admin Portal)

**Parent Details:**

* Name
* Email
* Phone number
* Location
* Password / Confirm password

**Kid Details (One or Many):**

* Name
* Gender
* Birth date
* Goal
* Currently in sports (Yes/No)
* Session type (Individual / Group)
* Medical conditions

**Rules:**

* Parent must complete kid registration
* Login is blocked if kid registration is incomplete
* Admin can perform parent + kid registration via Admin Portal

---

## 5. Parent Portal – Dashboard Behavior

### Child Selection

* First child auto-selected on login
* Switching child updates dashboard data dynamically

### Tabs

#### 1. Overview

* Child profile summary
* Upcoming sessions

#### 2. Achievements

* Badges earned
* Parent can mark milestones 2 tasks (Nutrition, Habits) as completed
* Milestone progress (Individual sessions only)

#### 3. Schedule

* Calendar view of sessions
* Session actions:

  * Confirm
  * Request reschedule (Admin approval required)
* Book Extra Session:

  * Select coach, type, and location
  * Request sent to Admin

#### 4. Progress

* Under discussion (future enhancement)

### Conditional Views

* **Individual Sessions:** All tabs visible
* **Group Sessions:** Only Overview and Schedule tabs visible

---

## 6. Parent Portal – Navigation

### Header Menu

* Dashboard
* Profile (update parent details)
* Logout

### Sidebar

* Kids’ Profile
* Invoices (paid / unpaid / outstanding amounts)

---

## 7. Coach Portal (Client Portal Login)

### Dashboard Tabs

#### 1. Overview

* Course details
* Upcoming sessions

#### 2. Activities

* Create and assign milestones
* Milestone tasks:

  * Gym Activity (Coach)
  * Nutrition (Parent)
  * Habits (Parent)
* Auto-badge awarded on completion
* Individual session milestones are personalized

#### 3. Sessions

* Calendar view
* Session details:

  * Date & time
  * Location
  * Group / Individual
  * Kids list (group)
  * Relevant kid details (individual)

### Session Actions

* Accept & confirm session
* Reschedule session

### Profile Menu

* Dashboard
* Profile
* Logout

### Invoices

* View coach payouts and payment status

---

## 8. Admin Portal Overview

### Sidebar Modules

* Dashboard
* Users
* Sessions
* Codes
* Kids
* Requests
* Invoices
* Banner Management
* Locations
* Resources
* Quizzes
* CRM
* Audit
* Reports

---

## 9. Admin Portal – Key Functions

### Dashboard

* Today’s sessions
* Free session requests
* Reschedule requests
* Weekly sessions
* Finance summary
* Activity logs

### Users

* Parents: view, add, edit, delete, link kids
* Coaches: view, add, edit, delete

### Kids

* Profile management
* Session type, milestones, achievements

### Sessions

* Calendar management
* Create group or individual sessions
* Assign coaches and kids
* Free session capacity control
* Approve reschedules and cancellations

### Invoices

* Parent & coach invoices
* Payment status tracking
* Export (PDF / CSV)

### Locations

* Manage training locations

### Banner Management

* Manage promotional banners for client portal

---

## 10. Notifications

* WhatsApp and Email notifications for:

  * Free session confirmations
  * Session changes
  * Invoice updates

---

## 11. Security & Permissions

* Role-based access control (RBAC)
* Admin-only actions enforced
* Coaches have limited kid data access
* Parents access only their own kids

---

## 12. Error Handling & Validations

* Prevent login if signup is incomplete
* Slot availability validation for free sessions
* Approval workflows for reschedules

---

## 13. Future Enhancements

* Progress tab implementation
* Advanced reporting
* Parent self-service rescheduling rules
* Mobile app support

---

## 14. Maintainers

* Product Owner: Grow Fitness Admin
* Development Team: Grow Fitness Engineering

---

*Last updated: YYYY-MM-DD*
