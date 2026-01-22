# Resource Management System - Complete Backend Technical Design Document

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Endpoints Specification](#4-api-endpoints-specification)
5. [Authentication & User Management](#5-authentication--user-management)
6. [New Business Acquisition Module](#6-new-business-acquisition-module)
7. [Data Flow & Business Logic](#7-data-flow--business-logic)
8. [Middleware & Validation](#8-middleware--validation)
9. [Error Handling](#9-error-handling)
10. [Caching Strategy](#10-caching-strategy)
11. [Scalability & Performance](#11-scalability--performance)
12. [Real-time Updates](#12-real-time-updates)
13. [Testing Strategy](#13-testing-strategy)
14. [Migration Guide](#14-migration-guide)

---

## 1. Executive Summary

### 1.1 Purpose

The Onboarding Ops Hub is a comprehensive enterprise resource management system for managing projects, clients, associates, and business acquisition pipelines. The system includes role-based access control, pricing calculations, revenue tracking, and a complete business acquisition workflow.

### 1.2 Key Features

- **Project Management**: Phase/milestone management, task creation and assignment
- **Resource Allocation**: Team member allocation with time tracking and lead designation
- **Pricing Calculator**: Dynamic pricing calculations with multi-currency support (USD, SAR, AED)
- **New Business Acquisition**: 6-stage pipeline (Bid Evaluation, Bid Manual, Bid Pricing, Consulting Vertical Lead, Win, Loss)
- **Broker Onboarding**: Onboarding workflow for won business leads
- **User Management**: Role-based access control with custom permission overrides
- **Authentication**: Login/registration with password validation
- **Revenue Tracking**: Project revenue and forecasting

### 1.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| State Management | Zustand with persist middleware |
| Database | PostgreSQL (Supabase/Neon) - Future |
| Cache | Redis (Upstash) - Future |
| Real-time | Supabase Realtime / WebSockets - Future |
| Authentication | Custom JWT / Supabase Auth |
| Validation | Zod |
| UI Components | shadcn/ui + Tailwind CSS v4 |

### 1.4 Application Pages (23 Total)

| Page | Route | Permission Key |
|------|-------|----------------|
| Dashboard | `/` | `dashboard` |
| Projects | `/projects` | `projects` |
| Project Detail | `/projects/[id]` | `projects` |
| New Business | `/new-business` | `newBusiness` |
| Broker Onboarding | `/broker-onboarding` | `brokerOnboarding` |
| Project Board | `/project-board` | `projectBoard` |
| Clients | `/clients` | `clients` |
| Client Detail | `/clients/[id]` | `clients` |
| Advisory | `/advisory` | `advisory` |
| Associates | `/associates` | `associates` |
| Associate Detail | `/associates/[id]` | `associates` |
| New Associate | `/associates/new` | `associates` |
| Documents Hub | `/documents` | `documents` |
| Milestones | `/milestones` | `milestones` |
| Revenue Tracker | `/revenue` | `revenue` |
| Revenue Detail | `/revenue/[projectId]` | `revenue` |
| Calculator | `/calculator` | `calculator` |
| Calculator Detail | `/calculator/[projectId]` | `calculator` |
| Performance | `/performance` | `performance` |
| Settings | `/settings` | `settings` |
| User Management | `/admin/users` | `userManagement` |
| Login | `/login` | Public |
| Register | `/register` | Public |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Dashboard      │  │  New Business   │  │  Calculator     │                 │
│  │  & Projects     │  │  Acquisition    │  │  & Pricing      │                 │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                 │
│           │                    │                    │                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  User Mgmt      │  │  Broker         │  │  Revenue        │                 │
│  │  & Auth         │  │  Onboarding     │  │  Tracker        │                 │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                 │
│           └────────────────────┼────────────────────┘                           │
│                                │                                                 │
├────────────────────────────────┼─────────────────────────────────────────────────┤
│                           STATE LAYER (Zustand)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   store     │  │  auth-store │  │  user-store │  │  pricing-   │            │
│  │   (main)    │  │             │  │             │  │  store      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐                                               │
│  │  business-  │  │  revenue-   │                                               │
│  │  acquisition│  │  store      │                                               │
│  └─────────────┘  └─────────────┘                                               │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                           API LAYER (Future)                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    NEXT.JS API ROUTES / SERVER ACTIONS                   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │ /api/auth   │  │ /api/users  │  │ /api/leads  │  │ /api/       │    │    │
│  │  │             │  │             │  │             │  │ projects    │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER (Future)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   PostgreSQL    │  │     Redis       │  │   Blob Storage  │                 │
│  │   (Primary)     │  │    (Cache)      │  │   (Documents)   │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Store Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ZUSTAND STORE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  store.ts (Main Application Store)                                     │  │
│  │  ├─ projects: Project[]                                                │  │
│  │  ├─ clients: Client[]                                                  │  │
│  │  ├─ associates: Associate[]                                            │  │
│  │  ├─ addProject(), updateProject(), deleteProject()                     │  │
│  │  ├─ addClient(), updateClient()                                        │  │
│  │  ├─ addAssociate(), updateAssociate()                                  │  │
│  │  └─ assignAssociateToProject(), removeAssociateFromProject()           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  auth-store.ts (Authentication & Permissions)                          │  │
│  │  ├─ user: AuthUser | null                                              │  │
│  │  ├─ isAuthenticated: boolean                                           │  │
│  │  ├─ ROLE_PERMISSIONS: Record<UserRole, RolePermissions>                │  │
│  │  ├─ login(), logout()                                                  │  │
│  │  └─ hasPermission(), getEffectivePermissions()                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  user-store.ts (User Management)                                       │  │
│  │  ├─ users: AuthUser[]                                                  │  │
│  │  ├─ addUser(), updateUser(), deleteUser()                              │  │
│  │  ├─ updateUserRole(), toggleUserActive()                               │  │
│  │  ├─ updateUserPermission() - Custom permission overrides               │  │
│  │  └─ resetUserPermissions() - Reset to role defaults                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  business-acquisition-store.ts (New Business Pipeline)                 │  │
│  │  ├─ leads: BusinessLead[]                                              │  │
│  │  ├─ ACQUISITION_STAGES: 6-stage pipeline definition                    │  │
│  │  ├─ addLead(), updateLead(), deleteLead()                              │  │
│  │  ├─ moveToStage() - Pipeline progression                               │  │
│  │  ├─ markAsWin() - Convert to project/client                            │  │
│  │  ├─ markAsLoss() - Record loss reason                                  │  │
│  │  └─ addNote(), addContact(), removeContact()                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  pricing-store.ts (Resource & Pricing Management)                      │  │
│  │  ├─ projectPricing: Map<projectId, ProjectPricing>                     │  │
│  │  ├─ initProjectPricing(), calculateProjectTotals()                     │  │
│  │  ├─ addTaskAssignee(), updateTaskAssignee(), removeTaskAssignee()      │  │
│  │  ├─ updateTaskSettings() - Time unit, duration                         │  │
│  │  └─ TaskAssignee.isLead - First assignee is lead                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  revenue-store.ts (Revenue Tracking)                                   │  │
│  │  ├─ projectRevenue: Map<projectId, RevenueData>                        │  │
│  │  ├─ invoices, payments, forecasts                                      │  │
│  │  └─ calculateRevenueTotals(), generateForecast()                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIPS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │    users     │                                                           │
│  │──────────────│                                                           │
│  │ id (PK)      │                                                           │
│  │ email        │◄─────────────────────────────────────────┐                │
│  │ name         │                                          │                │
│  │ role         │                                          │                │
│  │ avatar       │                                          │                │
│  │ is_active    │                                          │                │
│  │ custom_perms │ (JSONB)                                  │                │
│  │ associate_id │───────────────────────────┐              │                │
│  └──────────────┘                           │              │                │
│                                             │              │                │
│  ┌──────────────┐       ┌──────────────┐    │              │                │
│  │   clients    │       │  associates  │◄───┘              │                │
│  │──────────────│       │──────────────│                   │                │
│  │ id (PK)      │       │ id (PK)      │                   │                │
│  │ name         │       │ name         │                   │                │
│  │ industry     │       │ role         │                   │                │
│  │ contact_*    │       │ hourly_rate  │                   │                │
│  └──────┬───────┘       │ daily_rate   │                   │                │
│         │               └──────┬───────┘                   │                │
│         │                      │                           │                │
│         │      ┌───────────────┼───────────────┐           │                │
│         │      │               │               │           │                │
│         ▼      ▼               ▼               │           │                │
│  ┌──────────────┐       ┌──────────────┐      │           │                │
│  │   projects   │       │    tasks     │      │           │                │
│  │──────────────│       │──────────────│      │           │                │
│  │ id (PK)      │       │ id (PK)      │      │           │                │
│  │ client_id(FK)│       │ milestone_id │      │           │                │
│  │ name         │       │ name         │      │           │                │
│  │ lifecycle    │       │ time_unit    │      │           │                │
│  │ health       │       │ duration     │      │           │                │
│  └──────┬───────┘       └──────┬───────┘      │           │                │
│         │                      │               │           │                │
│         ▼                      ▼               │           │                │
│  ┌──────────────┐       ┌──────────────┐      │           │                │
│  │  milestones  │       │task_assignees│      │           │                │
│  │──────────────│       │──────────────│      │           │                │
│  │ id (PK)      │       │ id (PK)      │      │           │                │
│  │ project_id   │       │ task_id (FK) │      │           │                │
│  │ name         │       │ associate_id │◄─────┘           │                │
│  │ start_date   │       │ days         │                  │                │
│  │ end_date     │       │ days_per_prd │                  │                │
│  └──────────────┘       │ is_lead      │ (BOOLEAN)        │                │
│                         └──────────────┘                  │                │
│                                                           │                │
│  ┌──────────────┐       ┌──────────────┐                  │                │
│  │business_leads│       │ lead_notes   │                  │                │
│  │──────────────│       │──────────────│                  │                │
│  │ id (PK)      │◄──────│ lead_id (FK) │                  │                │
│  │ name         │       │ content      │                  │                │
│  │ company_name │       │ created_by   │──────────────────┘                │
│  │ stage        │       │ created_at   │                                   │
│  │ lead_owner   │       └──────────────┘                                   │
│  │ est_value    │                                                          │
│  │ probability  │       ┌──────────────┐                                   │
│  │ loss_reason  │       │lead_contacts │                                   │
│  │ win_date     │       │──────────────│                                   │
│  │ loss_date    │◄──────│ lead_id (FK) │                                   │
│  │ converted_*  │       │ name         │                                   │
│  └──────────────┘       │ email        │                                   │
│                         │ is_primary   │                                   │
│                         └──────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Complete SQL Schema

```sql
-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('elt', 'association-manager', 'engagement-lead', 'associate')),
  avatar VARCHAR(500),
  associate_id UUID REFERENCES associates(id),
  is_active BOOLEAN DEFAULT true,
  custom_permissions JSONB DEFAULT NULL, -- Override specific role permissions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- CLIENTS
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ASSOCIATES
-- ============================================================================

CREATE TABLE associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  seniority VARCHAR(50),
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  phone VARCHAR(50),
  location VARCHAR(255),
  bio TEXT,
  avatar VARCHAR(500),
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  availability_status VARCHAR(50) DEFAULT 'available',
  active_projects INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  description TEXT,
  lifecycle VARCHAR(50) NOT NULL CHECK (lifecycle IN ('new-business', 'onboarding', 'execution', 'closure', 'learnings')),
  health VARCHAR(50) DEFAULT 'on-track' CHECK (health IN ('on-track', 'at-risk', 'delayed', 'completed')),
  priority VARCHAR(50) DEFAULT 'medium',
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  engagement_lead_id UUID REFERENCES associates(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_lifecycle ON projects(lifecycle);
CREATE INDEX idx_projects_health ON projects(health);

-- ============================================================================
-- MILESTONES
-- ============================================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON milestones(project_id);

-- ============================================================================
-- TASKS
-- ============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  time_unit VARCHAR(20) DEFAULT 'full' CHECK (time_unit IN ('full', 'week', 'month')),
  duration INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);

-- ============================================================================
-- TASK ASSIGNEES (Resource Allocation)
-- ============================================================================

CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  associate_id UUID NOT NULL REFERENCES associates(id) ON DELETE CASCADE,
  days DECIMAL(10,2) DEFAULT 0,
  days_per_period DECIMAL(10,2) DEFAULT 0,
  is_lead BOOLEAN DEFAULT false, -- First assignee is marked as lead
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(task_id, associate_id)
);

CREATE INDEX idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_associate ON task_assignees(associate_id);

-- Trigger to automatically set is_lead for first assignee
CREATE OR REPLACE FUNCTION set_first_assignee_as_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM task_assignees WHERE task_id = NEW.task_id) THEN
    NEW.is_lead := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lead
  BEFORE INSERT ON task_assignees
  FOR EACH ROW
  EXECUTE FUNCTION set_first_assignee_as_lead();

-- ============================================================================
-- BUSINESS LEADS (New Business Acquisition)
-- ============================================================================

CREATE TABLE business_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  estimated_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  stage VARCHAR(50) NOT NULL CHECK (stage IN (
    'bid-evaluation',
    'bid-manual', 
    'bid-pricing',
    'consulting-vertical-lead',
    'win',
    'loss'
  )),
  lead_owner_id UUID NOT NULL REFERENCES associates(id),
  description TEXT,
  source VARCHAR(100), -- How the lead was acquired
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  tags TEXT[] DEFAULT '{}',
  
  -- Loss fields
  loss_reason TEXT,
  loss_date DATE,
  loss_notes TEXT,
  competitor_won VARCHAR(255),
  
  -- Win fields
  win_date DATE,
  converted_project_id UUID REFERENCES projects(id),
  converted_client_id UUID REFERENCES clients(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_stage ON business_leads(stage);
CREATE INDEX idx_leads_owner ON business_leads(lead_owner_id);

-- ============================================================================
-- LEAD CONTACTS
-- ============================================================================

CREATE TABLE lead_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES business_leads(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_contacts_lead ON lead_contacts(lead_id);

-- ============================================================================
-- LEAD NOTES
-- ============================================================================

CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES business_leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_notes_lead ON lead_notes(lead_id);

-- ============================================================================
-- LEAD STAGE HISTORY
-- ============================================================================

CREATE TABLE lead_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES business_leads(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  updated_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_history_lead ON lead_stage_history(lead_id);
```

---

## 4. API Endpoints Specification

### 4.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login with email/password |
| POST | `/api/auth/register` | New user registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Change password |

#### POST /api/auth/login

```typescript
// Request
interface LoginRequest {
  email: string
  password: string
}

// Response
interface LoginResponse {
  success: boolean
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    avatar?: string
    permissions: RolePermissions
  }
  token: string
}

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})
```

#### POST /api/auth/register

```typescript
// Request
interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: UserRole // Defaults to 'associate'
}

// Password Validation Rules
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
```

### 4.2 User Management Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/users` | List all users | `userManagement` |
| GET | `/api/users/:id` | Get user by ID | `userManagement` |
| POST | `/api/users` | Create user | `manageUsers` |
| PUT | `/api/users/:id` | Update user | `manageUsers` |
| DELETE | `/api/users/:id` | Delete user | `manageUsers` |
| PUT | `/api/users/:id/role` | Change user role | `managePermissions` |
| PUT | `/api/users/:id/permissions` | Update custom permissions | `managePermissions` |
| DELETE | `/api/users/:id/permissions` | Reset to role defaults | `managePermissions` |
| PUT | `/api/users/:id/status` | Toggle active status | `manageUsers` |

#### PUT /api/users/:id/permissions

```typescript
// Request - Update individual permission
interface UpdatePermissionRequest {
  permissionKey: keyof RolePermissions
  value: boolean
}

// Implementation
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { permissionKey, value } = await req.json()
  
  // Get current user's custom permissions
  const user = await getUserById(params.id)
  const customPermissions = user.customPermissions || {}
  
  // Update specific permission
  customPermissions[permissionKey] = value
  
  await updateUser(params.id, { customPermissions })
  
  return Response.json({ success: true })
}
```

### 4.3 Business Acquisition Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/leads` | List all leads | `newBusiness` |
| GET | `/api/leads/:id` | Get lead details | `newBusiness` |
| POST | `/api/leads` | Create new lead | `newBusiness` |
| PUT | `/api/leads/:id` | Update lead | `newBusiness` |
| DELETE | `/api/leads/:id` | Delete lead | `newBusiness` |
| PUT | `/api/leads/:id/stage` | Move to stage | `newBusiness` |
| POST | `/api/leads/:id/win` | Mark as won | `newBusiness` |
| POST | `/api/leads/:id/loss` | Mark as lost | `newBusiness` |
| GET | `/api/leads/wins` | Get all won leads | `newBusiness` |
| GET | `/api/leads/losses` | Get all lost leads | `newBusiness` |
| POST | `/api/leads/:id/notes` | Add note | `newBusiness` |
| POST | `/api/leads/:id/contacts` | Add contact | `newBusiness` |

#### POST /api/leads/:id/win

```typescript
// Request
interface MarkAsWinRequest {
  userId: string
  projectId?: string // Optional - link to created project
  clientId?: string  // Optional - link to created client
}

// Implementation
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId, projectId, clientId } = await req.json()
  
  await db.transaction(async (tx) => {
    // Update lead
    await tx.update('business_leads', {
      stage: 'win',
      win_date: new Date().toISOString(),
      converted_project_id: projectId,
      converted_client_id: clientId,
      updated_at: new Date().toISOString()
    }).where({ id: params.id })
    
    // Add stage history
    await tx.insert('lead_stage_history', {
      lead_id: params.id,
      stage: 'win',
      updated_by: userId,
      notes: 'Lead marked as won'
    })
  })
  
  return Response.json({ success: true, redirectTo: '/broker-onboarding' })
}
```

#### POST /api/leads/:id/loss

```typescript
// Request
interface MarkAsLossRequest {
  userId: string
  reason: string
  competitor?: string
  notes?: string
}

// Implementation
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId, reason, competitor, notes } = await req.json()
  
  await db.transaction(async (tx) => {
    await tx.update('business_leads', {
      stage: 'loss',
      loss_date: new Date().toISOString(),
      loss_reason: reason,
      competitor_won: competitor,
      loss_notes: notes,
      updated_at: new Date().toISOString()
    }).where({ id: params.id })
    
    await tx.insert('lead_stage_history', {
      lead_id: params.id,
      stage: 'loss',
      updated_by: userId,
      notes: reason
    })
  })
  
  return Response.json({ success: true, redirectTo: '/projects?tab=losses' })
}
```

### 4.4 Project & Resource Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project details |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/milestones` | Get milestones |
| POST | `/api/projects/:id/milestones` | Create milestone |
| GET | `/api/projects/:id/pricing` | Get pricing data |
| PUT | `/api/projects/:id/pricing` | Update pricing |

### 4.5 Task Assignee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:taskId/assignees` | Get task assignees |
| POST | `/api/tasks/:taskId/assignees` | Add assignee |
| PUT | `/api/tasks/:taskId/assignees/:assigneeId` | Update assignee |
| DELETE | `/api/tasks/:taskId/assignees/:assigneeId` | Remove assignee |
| PUT | `/api/tasks/:taskId/assignees/:assigneeId/lead` | Set as lead |

#### POST /api/tasks/:taskId/assignees

```typescript
// Request
interface AddAssigneeRequest {
  associateId: string
  days?: number
  daysPerPeriod?: number
}

// Implementation - First assignee is automatically the lead
export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const { associateId, days = 0, daysPerPeriod = 0 } = await req.json()
  
  // Check if first assignee
  const existingCount = await db.count('task_assignees').where({ task_id: params.taskId })
  const isLead = existingCount === 0
  
  const assignee = await db.insert('task_assignees', {
    task_id: params.taskId,
    associate_id: associateId,
    days,
    days_per_period: daysPerPeriod,
    is_lead: isLead
  }).returning('*')
  
  return Response.json(assignee)
}
```

---

## 5. Authentication & User Management

### 5.1 Role-Based Access Control

```typescript
export type UserRole = "elt" | "association-manager" | "engagement-lead" | "associate"

export interface RolePermissions {
  // Navigation Access (15 pages)
  dashboard: boolean
  projects: boolean
  projectBoard: boolean
  clients: boolean
  associates: boolean
  documents: boolean
  milestones: boolean
  performance: boolean
  settings: boolean
  revenue: boolean
  advisory: boolean
  calculator: boolean
  userManagement: boolean
  newBusiness: boolean
  brokerOnboarding: boolean
  
  // Feature Access
  createProject: boolean
  editProject: boolean
  deleteProject: boolean
  createClient: boolean
  editClient: boolean
  createAssociate: boolean
  editAssociate: boolean
  manageTeam: boolean
  viewAllProjects: boolean
  viewOwnProjectsOnly: boolean
  viewAssignedTasksOnly: boolean
  manageUsers: boolean
  managePermissions: boolean
}
```

### 5.2 Permission Matrix

| Permission | ELT | Association Manager | Engagement Lead | Associate |
|------------|-----|---------------------|-----------------|-----------|
| **Navigation** |
| Dashboard | Yes | Yes | Yes | No |
| Projects | Yes | Yes | Yes | Yes |
| New Business | Yes | Yes | No | No |
| Broker Onboarding | Yes | Yes | No | No |
| Project Board | Yes | No | No | No |
| Clients | Yes | Yes | No | No |
| Advisory | Yes | Yes | No | No |
| Associates | Yes | Yes | No | No |
| Documents | Yes | Yes | Yes | No |
| Milestones | Yes | Yes | Yes | No |
| Revenue | Yes | Yes | No | No |
| Calculator | Yes | Yes | No | No |
| Performance | Yes | Yes | No | No |
| Settings | Yes | No | No | No |
| User Management | Yes | No | No | No |
| **Features** |
| Create Project | Yes | Yes | No | No |
| Edit Project | Yes | Yes | Yes | No |
| Delete Project | Yes | No | No | No |
| Manage Users | Yes | No | No | No |
| Manage Permissions | Yes | No | No | No |

### 5.3 Custom Permission Overrides

Users can have custom permission overrides that supersede their role defaults:

```typescript
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  associateId?: string
  isActive?: boolean
  createdAt?: string
  lastLogin?: string
  customPermissions?: Partial<RolePermissions> // Override specific permissions
}

// Get effective permissions for a user
function getEffectivePermissions(user: AuthUser): RolePermissions {
  const rolePermissions = ROLE_PERMISSIONS[user.role]
  
  if (!user.customPermissions) {
    return rolePermissions
  }
  
  return {
    ...rolePermissions,
    ...user.customPermissions
  }
}
```

### 5.4 Auth Guard Implementation

```typescript
// components/auth/auth-guard.tsx
const ROUTE_PERMISSIONS: Record<string, keyof RolePermissions> = {
  "/": "dashboard",
  "/projects": "projects",
  "/new-business": "newBusiness",
  "/broker-onboarding": "brokerOnboarding",
  "/project-board": "projectBoard",
  "/clients": "clients",
  "/associates": "associates",
  "/documents": "documents",
  "/milestones": "milestones",
  "/performance": "performance",
  "/settings": "settings",
  "/advisory": "advisory",
  "/revenue": "revenue",
  "/calculator": "calculator",
  "/admin": "userManagement",
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    
    // Check route permission
    const permissionKey = ROUTE_PERMISSIONS[pathname]
    if (permissionKey) {
      const permissions = getEffectivePermissions(user)
      if (!permissions[permissionKey]) {
        router.replace("/") // Redirect to dashboard if no access
      }
    }
  }, [isAuthenticated, pathname, user])
  
  if (!isAuthenticated) return null
  
  return <>{children}</>
}
```

---

## 6. New Business Acquisition Module

### 6.1 Pipeline Stages

```typescript
export type AcquisitionStage = 
  | "bid-evaluation"      // Stage 1: Initial evaluation
  | "bid-manual"          // Stage 2: Documentation review
  | "bid-pricing"         // Stage 3: Pricing proposal
  | "consulting-vertical-lead"  // Stage 4: Leadership approval
  | "win"                 // Final: Won
  | "loss"                // Final: Lost

export const ACQUISITION_STAGES = [
  { id: "bid-evaluation", title: "Bid Evaluation Process", description: "Initial evaluation of the business opportunity" },
  { id: "bid-manual", title: "Bid Manual", description: "Documentation and manual review process" },
  { id: "bid-pricing", title: "Bid Pricing Process", description: "Pricing strategy and proposal development" },
  { id: "consulting-vertical-lead", title: "Consulting Vertical Lead", description: "Leadership review and approval" },
  { id: "win", title: "Win", description: "Successfully acquired business" },
  { id: "loss", title: "Loss", description: "Did not win the business" },
]
```

### 6.2 Business Lead Entity

```typescript
export interface BusinessLead {
  id: string
  name: string
  companyName: string
  industry: string
  estimatedValue: number
  currency: string
  stage: AcquisitionStage
  leadOwnerId: string // Associate ID
  contacts: LeadContact[]
  description: string
  source: string // How the lead was acquired
  probability: number // Win probability 0-100
  expectedCloseDate: string
  createdAt: string
  updatedAt: string
  stageHistory: StageUpdate[]
  notes: LeadNote[]
  tags: string[]
  
  // Loss-specific fields
  lossReason?: string
  lossDate?: string
  lossNotes?: string
  competitorWon?: string
  
  // Win-specific fields
  winDate?: string
  convertedProjectId?: string
  convertedClientId?: string
}
```

### 6.3 Win/Loss Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     NEW BUSINESS ACQUISITION WORKFLOW                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│  │   Bid    │──▶│   Bid    │──▶│   Bid    │──▶│Consulting│             │
│  │Evaluation│   │  Manual  │   │ Pricing  │   │ Vertical │             │
│  └──────────┘   └──────────┘   └──────────┘   └────┬─────┘             │
│                                                     │                    │
│                                          ┌─────────┴─────────┐          │
│                                          │                   │          │
│                                          ▼                   ▼          │
│                                    ┌──────────┐        ┌──────────┐    │
│                                    │   WIN    │        │   LOSS   │    │
│                                    └────┬─────┘        └────┬─────┘    │
│                                         │                   │          │
│                                         ▼                   ▼          │
│                                  ┌─────────────┐    ┌─────────────┐    │
│                                  │   Broker    │    │  Projects   │    │
│                                  │ Onboarding  │    │ Loss Tab    │    │
│                                  └─────────────┘    └─────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Broker Onboarding Checklist

When a lead is marked as "Win", it moves to the Broker Onboarding page with:

```typescript
const ONBOARDING_CHECKLIST = [
  { id: "contract", label: "Contract Signed", required: true },
  { id: "nda", label: "NDA Executed", required: true },
  { id: "kickoff", label: "Kickoff Meeting Scheduled", required: true },
  { id: "team", label: "Team Assigned", required: true },
  { id: "access", label: "System Access Granted", required: false },
  { id: "documentation", label: "Documentation Shared", required: false },
  { id: "billing", label: "Billing Setup Complete", required: true },
]
```

---

## 7. Data Flow & Business Logic

### 7.1 Task Assignment with Lead Designation

```typescript
// When adding first assignee to a task, they become the lead
function addTaskAssignee(projectId: string, phaseId: string, taskId: string, associateId: string) {
  const taskEntry = getTaskEntry(projectId, phaseId, taskId)
  
  // Check if already assigned
  if (taskEntry.assignees.some(a => a.associateId === associateId)) {
    return
  }
  
  // First person is the lead
  const isFirstAssignee = taskEntry.assignees.length === 0
  
  taskEntry.assignees.push({
    associateId,
    days: 0,
    daysPerPeriod: 0,
    isLead: isFirstAssignee
  })
}
```

### 7.2 Time Unit Calculation

```typescript
// Calculate total days based on time unit
function calculateTotalDays(
  timeUnit: 'full' | 'week' | 'month',
  duration: number,
  daysPerPeriod: number
): number {
  switch (timeUnit) {
    case 'full':
      return daysPerPeriod // Direct days input
    case 'week':
      return duration * daysPerPeriod // weeks × days/week
    case 'month':
      return duration * daysPerPeriod * 4 // months × days/month × 4 weeks
  }
}
```

### 7.3 Pricing Calculation

```typescript
interface PricingCalculation {
  // Per assignee
  assigneeDays: number
  assigneeRate: number
  assigneeCost: number
  
  // Per task
  taskTotalDays: number
  taskTotalCost: number
  
  // Per phase/milestone
  phaseTotalDays: number
  phaseTotalCost: number
  
  // Project total
  projectTotalDays: number
  projectTotalCost: number
  currency: string
}

function calculateProjectPricing(projectId: string): PricingCalculation {
  const pricing = getProjectPricing(projectId)
  let projectTotalDays = 0
  let projectTotalCost = 0
  
  for (const phase of pricing.phases) {
    let phaseTotalDays = 0
    let phaseTotalCost = 0
    
    for (const task of phase.tasks) {
      let taskTotalDays = 0
      let taskTotalCost = 0
      
      for (const assignee of task.assignees) {
        const associate = getAssociate(assignee.associateId)
        const days = calculateTotalDays(task.timeUnit, task.duration, assignee.daysPerPeriod)
        const cost = days * (associate?.dailyRate || 0)
        
        taskTotalDays += days
        taskTotalCost += cost
      }
      
      phaseTotalDays += taskTotalDays
      phaseTotalCost += taskTotalCost
    }
    
    projectTotalDays += phaseTotalDays
    projectTotalCost += phaseTotalCost
  }
  
  return { projectTotalDays, projectTotalCost, currency: pricing.currency }
}
```

---

## 8. Middleware & Validation

### 8.1 Authentication Middleware

```typescript
// middleware/auth.ts
export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const payload = verifyJWT(token)
    req.user = payload
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

### 8.2 Permission Middleware

```typescript
// middleware/permission.ts
export function requirePermission(permission: keyof RolePermissions) {
  return async (req: NextRequest) => {
    const user = req.user
    const permissions = getEffectivePermissions(user)
    
    if (!permissions[permission]) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.next()
  }
}
```

### 8.3 Validation Schemas

```typescript
// schemas/lead.ts
export const createLeadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  estimatedValue: z.number().min(0),
  currency: z.enum(["USD", "SAR", "AED"]).default("USD"),
  leadOwnerId: z.string().uuid("Invalid lead owner ID"),
  description: z.string().optional(),
  source: z.string().optional(),
  probability: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().datetime().optional(),
  tags: z.array(z.string()).default([])
})

// schemas/user.ts
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
  role: z.enum(["elt", "association-manager", "engagement-lead", "associate"]),
  associateId: z.string().uuid().optional()
})
```

---

## 9. Error Handling

### 9.1 Error Types

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: z.ZodError) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}
```

### 9.2 Global Error Handler

```typescript
export function handleError(error: unknown): NextResponse {
  console.error('[API Error]', error)
  
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code
      }
    }, { status: error.statusCode })
  }
  
  return NextResponse.json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  }, { status: 500 })
}
```

---

## 10. Caching Strategy

### 10.1 Cache Keys

```typescript
const CACHE_KEYS = {
  user: (id: string) => `user:${id}`,
  userPermissions: (id: string) => `user:${id}:permissions`,
  project: (id: string) => `project:${id}`,
  projectPricing: (id: string) => `project:${id}:pricing`,
  leads: 'leads:all',
  leadsByStage: (stage: string) => `leads:stage:${stage}`,
  associates: 'associates:all',
  clients: 'clients:all',
}

const CACHE_TTL = {
  user: 3600,        // 1 hour
  permissions: 300,  // 5 minutes
  project: 1800,     // 30 minutes
  leads: 300,        // 5 minutes
  static: 86400,     // 24 hours
}
```

### 10.2 Cache Invalidation

```typescript
async function invalidateUserCache(userId: string) {
  await Promise.all([
    redis.del(CACHE_KEYS.user(userId)),
    redis.del(CACHE_KEYS.userPermissions(userId))
  ])
}

async function invalidateLeadCache(leadId: string, stage?: string) {
  await Promise.all([
    redis.del(CACHE_KEYS.leads),
    stage && redis.del(CACHE_KEYS.leadsByStage(stage))
  ])
}
```

---

## 11. Scalability & Performance

### 11.1 Database Optimization

```sql
-- Partial indexes for active records
CREATE INDEX idx_users_active ON users(email) WHERE is_active = true;
CREATE INDEX idx_leads_active_stage ON business_leads(stage) WHERE stage NOT IN ('win', 'loss');

-- Covering indexes for common queries
CREATE INDEX idx_task_assignees_covering ON task_assignees(task_id, associate_id) 
  INCLUDE (days, days_per_period, is_lead);
```

### 11.2 Query Optimization

```typescript
// Batch loading for pricing calculations
async function getProjectPricingBatch(projectIds: string[]) {
  const results = await db.query(`
    SELECT 
      p.id as project_id,
      m.id as milestone_id,
      t.id as task_id,
      ta.associate_id,
      ta.days,
      ta.days_per_period,
      ta.is_lead,
      a.daily_rate
    FROM projects p
    JOIN milestones m ON m.project_id = p.id
    JOIN tasks t ON t.milestone_id = m.id
    LEFT JOIN task_assignees ta ON ta.task_id = t.id
    LEFT JOIN associates a ON a.id = ta.associate_id
    WHERE p.id = ANY($1)
    ORDER BY p.id, m.order_index, t.order_index
  `, [projectIds])
  
  return groupByProject(results)
}
```

---

## 12. Real-time Updates

### 12.1 WebSocket Events

```typescript
const REALTIME_EVENTS = {
  // Lead updates
  'lead:created': (lead: BusinessLead) => void,
  'lead:updated': (lead: BusinessLead) => void,
  'lead:stage_changed': (leadId: string, stage: AcquisitionStage) => void,
  'lead:deleted': (leadId: string) => void,
  
  // Task updates
  'task:assignee_added': (taskId: string, assignee: TaskAssignee) => void,
  'task:assignee_removed': (taskId: string, assigneeId: string) => void,
  
  // User updates
  'user:permissions_changed': (userId: string) => void,
  'user:status_changed': (userId: string, isActive: boolean) => void,
}
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

```typescript
describe('Permission System', () => {
  it('should apply custom permissions over role defaults', () => {
    const user: AuthUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: 'associate',
      customPermissions: {
        dashboard: true, // Override: associate normally can't access
      }
    }
    
    const permissions = getEffectivePermissions(user)
    
    expect(permissions.dashboard).toBe(true) // Custom override
    expect(permissions.projects).toBe(true)  // Role default
    expect(permissions.clients).toBe(false)  // Role default
  })
})

describe('Lead Pipeline', () => {
  it('should track stage history when moving stages', () => {
    const store = useBusinessAcquisitionStore.getState()
    const leadId = store.addLead({ name: 'Test Lead', ... })
    
    store.moveToStage(leadId, 'bid-manual', 'user-1', 'Moving to manual review')
    
    const lead = store.getLeadById(leadId)
    expect(lead.stage).toBe('bid-manual')
    expect(lead.stageHistory).toHaveLength(1)
    expect(lead.stageHistory[0].stage).toBe('bid-manual')
  })
})
```

### 13.2 Integration Tests

```typescript
describe('POST /api/leads/:id/win', () => {
  it('should mark lead as won and redirect to broker onboarding', async () => {
    const lead = await createTestLead({ stage: 'consulting-vertical-lead' })
    
    const response = await request(app)
      .post(`/api/leads/${lead.id}/win`)
      .send({ userId: 'test-user' })
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(response.body.redirectTo).toBe('/broker-onboarding')
    
    const updatedLead = await getLeadById(lead.id)
    expect(updatedLead.stage).toBe('win')
    expect(updatedLead.winDate).toBeDefined()
  })
})
```

---

## 14. Migration Guide

### 14.1 From Zustand to Database

```typescript
// Step 1: Export current Zustand state
const exportStoreData = () => {
  const appStore = useAppStore.getState()
  const authStore = useAuthStore.getState()
  const userStore = useUserStore.getState()
  const leadStore = useBusinessAcquisitionStore.getState()
  const pricingStore = usePricingStore.getState()
  
  return {
    projects: appStore.projects,
    clients: appStore.clients,
    associates: appStore.associates,
    users: userStore.users,
    leads: leadStore.leads,
    pricing: pricingStore.projectPricing,
  }
}

// Step 2: Migration script
async function migrateToDatabase() {
  const data = exportStoreData()
  
  await db.transaction(async (tx) => {
    // Insert clients
    for (const client of data.clients) {
      await tx.insert('clients', mapClientToDb(client))
    }
    
    // Insert associates
    for (const associate of data.associates) {
      await tx.insert('associates', mapAssociateToDb(associate))
    }
    
    // Insert users
    for (const user of data.users) {
      await tx.insert('users', mapUserToDb(user))
    }
    
    // Insert projects with milestones and tasks
    for (const project of data.projects) {
      const projectId = await tx.insert('projects', mapProjectToDb(project)).returning('id')
      
      for (const milestone of project.milestones) {
        const milestoneId = await tx.insert('milestones', {
          ...mapMilestoneToDb(milestone),
          project_id: projectId
        }).returning('id')
        
        // Get pricing data for tasks
        const pricingPhase = data.pricing.get(project.id)?.phases.find(p => p.id === milestone.id)
        
        for (const task of pricingPhase?.tasks || []) {
          const taskId = await tx.insert('tasks', {
            ...mapTaskToDb(task),
            milestone_id: milestoneId
          }).returning('id')
          
          for (const assignee of task.assignees) {
            await tx.insert('task_assignees', {
              task_id: taskId,
              associate_id: assignee.associateId,
              days: assignee.days,
              days_per_period: assignee.daysPerPeriod,
              is_lead: assignee.isLead
            })
          }
        }
      }
    }
    
    // Insert leads
    for (const lead of data.leads) {
      await tx.insert('business_leads', mapLeadToDb(lead))
    }
  })
}
```

---

## Appendix A: File Structure

```
/app
  /(auth)              # Removed - moved to /app/login, /app/register
  /(dashboard)
    /admin/users       # User management (ELT only)
    /advisory          # Advisory page
    /associates        # Associates list, detail, new
    /broker-onboarding # Onboarding for won leads
    /calculator        # Pricing calculator
    /clients           # Clients list, detail
    /documents         # Documents hub
    /milestones        # Milestones page
    /new-business      # New business acquisition pipeline
    /page.tsx          # Dashboard
    /performance       # Performance metrics
    /project-board     # Kanban project board
    /projects          # Projects list, detail (with wins/losses tabs)
    /revenue           # Revenue tracker
    /settings          # Settings page
  /login               # Login page
  /register            # Registration page
  /layout.tsx          # Root layout

/components
  /auth                # AuthGuard
  /calculator          # Pricing calculator components
  /copilot             # DEPRECATED - To be removed
  /layout              # Sidebar, Topbar, AppLayout
  /projects            # Project-related components
  /ui                  # shadcn/ui components

/lib
  /auth-store.ts       # Authentication & permissions
  /business-acquisition-store.ts  # Lead pipeline
  /copilot-store.ts    # DEPRECATED - To be removed
  /mock-data.ts        # Initial data & types
  /pricing-store.ts    # Pricing & resource allocation
  /pricing-types.ts    # Pricing type definitions
  /revenue-store.ts    # Revenue tracking
  /store.ts            # Main application store
  /user-store.ts       # User management
  /utils.ts            # Utility functions

/docs
  /RESOURCE_MANAGEMENT_SYSTEM.md  # This document
```

---

## Appendix B: Environment Variables

```env
# Database (Future)
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Redis Cache (Future)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-22 | Added: Login/Registration, User Management, New Business Acquisition, Broker Onboarding, Business Wins/Losses tabs, Lead designation for task assignees, Custom permission overrides |
| 1.0.0 | 2026-01-20 | Initial document with resource management system |
