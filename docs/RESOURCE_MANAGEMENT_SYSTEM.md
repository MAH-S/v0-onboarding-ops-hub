# Resource Management System - Complete Backend Technical Design Document

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Endpoints Specification](#4-api-endpoints-specification)
5. [Data Flow & Business Logic](#5-data-flow--business-logic)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Middleware & Validation](#7-middleware--validation)
8. [Error Handling](#8-error-handling)
9. [Caching Strategy](#9-caching-strategy)
10. [Scalability & Performance](#10-scalability--performance)
11. [Real-time Updates](#11-real-time-updates)
12. [Testing Strategy](#12-testing-strategy)
13. [Migration Guide](#13-migration-guide)

---

## 1. Executive Summary

### 1.1 Purpose

The Resource Management System is a comprehensive feature for managing project phases, milestones, tasks, and team member assignments with pricing calculations. The **Resourcing Grid** serves as the primary interface for creating and managing project structure, while the **Project Page** provides editing capabilities.

### 1.2 Key Features

- Project phase/milestone management
- Task creation and assignment
- Team member allocation with time tracking
- Dynamic pricing calculations
- Multi-currency support (USD, SAR, AED)
- Role-based access control
- Real-time collaboration

### 1.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL (Supabase/Neon) |
| Backend | Next.js API Routes / Server Actions |
| ORM | Raw SQL with parameterized queries |
| Cache | Redis (Upstash) |
| Real-time | Supabase Realtime / WebSockets |
| Authentication | Supabase Auth / Custom JWT |
| Validation | Zod |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Resourcing     │  │  Project        │  │  Calculator     │                 │
│  │  Grid           │  │  Page           │  │  Dashboard      │                 │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                 │
│           │                    │                    │                           │
│           └────────────────────┼────────────────────┘                           │
│                                │                                                 │
├────────────────────────────────┼─────────────────────────────────────────────────┤
│                           API LAYER                                              │
│                                │                                                 │
│  ┌─────────────────────────────┼─────────────────────────────────────────────┐  │
│  │                    NEXT.JS API ROUTES                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ /api/       │  │ /api/       │  │ /api/       │  │ /api/       │      │  │
│  │  │ projects    │  │ milestones  │  │ tasks       │  │ pricing     │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │  │
│  │         │                │                │                │              │  │
│  │         └────────────────┴────────────────┴────────────────┘              │  │
│  │                                    │                                       │  │
│  │  ┌─────────────────────────────────┼─────────────────────────────────┐    │  │
│  │  │              MIDDLEWARE LAYER                                      │    │  │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │    │  │
│  │  │  │   Auth    │  │   Rate    │  │  Validate │  │   Error   │       │    │  │
│  │  │  │  Verify   │  │  Limiter  │  │  Request  │  │  Handler  │       │    │  │
│  │  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘       │    │  │
│  │  └───────────────────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                           SERVICE LAYER                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │  Project    │  │  Milestone  │  │   Task      │  │  Pricing    │    │    │
│  │  │  Service    │  │  Service    │  │  Service    │  │  Service    │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │  Associate  │  │  Expense    │  │   Rate      │  │  Calculation│    │    │
│  │  │  Service    │  │  Service    │  │  Service    │  │  Service    │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                           DATA LAYER                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   PostgreSQL    │  │     Redis       │  │   Blob Storage  │                 │
│  │   (Primary)     │  │    (Cache)      │  │   (Documents)   │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Client Request                                                          │
│        │                                                                  │
│        ▼                                                                  │
│   ┌─────────────┐                                                        │
│   │   Proxy.js  │  ← Rate limiting, CORS, Request logging                │
│   └──────┬──────┘                                                        │
│          │                                                                │
│          ▼                                                                │
│   ┌─────────────┐                                                        │
│   │  Auth       │  ← JWT verification, Session validation                │
│   │  Middleware │                                                        │
│   └──────┬──────┘                                                        │
│          │                                                                │
│          ▼                                                                │
│   ┌─────────────┐                                                        │
│   │  Validation │  ← Zod schema validation, Sanitization                 │
│   │  Middleware │                                                        │
│   └──────┬──────┘                                                        │
│          │                                                                │
│          ▼                                                                │
│   ┌─────────────┐      ┌─────────────┐                                   │
│   │  API Route  │ ───▶ │   Service   │                                   │
│   │  Handler    │      │   Layer     │                                   │
│   └─────────────┘      └──────┬──────┘                                   │
│                               │                                           │
│          ┌────────────────────┼────────────────────┐                     │
│          │                    │                    │                      │
│          ▼                    ▼                    ▼                      │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│   │   Cache     │      │  Database   │      │  External   │             │
│   │   (Redis)   │      │  (Postgres) │      │  Services   │             │
│   └─────────────┘      └─────────────┘      └─────────────┘             │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESOURCE MANAGEMENT DATA FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                  │
│  │   PROJECT   │─────▶│  MILESTONE  │─────▶│    TASK     │                  │
│  │   (Phase)   │ 1:N  │  (Phase)    │ 1:N  │             │                  │
│  └─────────────┘      └─────────────┘      └─────────────┘                  │
│         │                    │                    │                          │
│         │                    │                    │                          │
│         ▼                    ▼                    ▼                          │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    PRICING LAYER                                  │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │        │
│  │  │   PROJECT    │  │  MILESTONE   │  │    TASK      │           │        │
│  │  │   PRICING    │──│   PRICING    │──│   PRICING    │           │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │        │
│  │         │                                    │                    │        │
│  │         │                                    ▼                    │        │
│  │         │              ┌─────────────────────────────────┐       │        │
│  │         │              │     TASK ASSIGNEES              │       │        │
│  │         │              │  (Team Members + Days + isLead) │       │        │
│  │         │              └─────────────────────────────────┘       │        │
│  │         │                          │                             │        │
│  │         ▼                          ▼                             │        │
│  │  ┌─────────────────────────────────────────────────────┐        │        │
│  │  │              ASSOCIATE RATES & EXPENSES              │        │        │
│  │  └─────────────────────────────────────────────────────┘        │        │
│  └─────────────────────────────────────────────────────────────────┘        │
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
│  ┌──────────┐                                                               │
│  │  CLIENT  │                                                               │
│  │──────────│                                                               │
│  │ id (PK)  │                                                               │
│  │ name     │                                                               │
│  │ industry │                                                               │
│  │ tier     │                                                               │
│  └────┬─────┘                                                               │
│       │ 1:N                                                                 │
│       ▼                                                                      │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                          │
│  │ PROJECT  │      │ ASSOCIATE│      │   USER   │                          │
│  │──────────│      │──────────│      │──────────│                          │
│  │ id (PK)  │◀────▶│ id (PK)  │      │ id (PK)  │                          │
│  │ client_id│ N:M  │ name     │      │ email    │                          │
│  │ owner_id │──────│ role     │◀─────│ role     │                          │
│  └────┬─────┘      │ email    │      │ assoc_id │                          │
│       │ 1:N        └────┬─────┘      └──────────┘                          │
│       ▼                 │                                                   │
│  ┌──────────┐          │                                                   │
│  │MILESTONE │          │                                                   │
│  │──────────│          │                                                   │
│  │ id (PK)  │          │                                                   │
│  │project_id│          │                                                   │
│  │ title    │          │                                                   │
│  └────┬─────┘          │                                                   │
│       │ 1:N            │                                                   │
│       ▼                │                                                   │
│  ┌──────────┐          │                                                   │
│  │   TASK   │          │                                                   │
│  │──────────│          │                                                   │
│  │ id (PK)  │          │                                                   │
│  │milestone │◀─────────┤                                                   │
│  │ _id (FK) │  N:M     │                                                   │
│  └────┬─────┘          │                                                   │
│       │                │                                                   │
│       │ 1:1            │                                                   │
│       ▼                │                                                   │
│  ┌──────────────┐      │                                                   │
│  │ TASK_PRICING │      │                                                   │
│  │──────────────│      │                                                   │
│  │ id (PK)      │      │                                                   │
│  │ task_id (FK) │      │                                                   │
│  │ time_unit    │      │                                                   │
│  │ periods      │      │                                                   │
│  └──────┬───────┘      │                                                   │
│         │ 1:N          │                                                   │
│         ▼              │                                                   │
│  ┌──────────────┐      │                                                   │
│  │TASK_ASSIGNEE │◀─────┘                                                   │
│  │──────────────│                                                          │
│  │ id (PK)      │                                                          │
│  │ task_pric_id │                                                          │
│  │ associate_id │                                                          │
│  │ days         │                                                          │
│  │ is_lead      │                                                          │
│  └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Complete SQL Schema

```sql
-- =====================================================
-- DATABASE SETUP
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users (Authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- NULL if using OAuth
  role VARCHAR(30) NOT NULL DEFAULT 'associate',
  avatar VARCHAR(500),
  associate_id UUID, -- Links to associate record
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN ('elt', 'association-manager', 'engagement-lead', 'associate'))
);

-- Sessions (for custom auth)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_sessions_token (token_hash),
  INDEX idx_sessions_user (user_id)
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  industry VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  tier VARCHAR(20) DEFAULT 'mid-market',
  client_type VARCHAR(20) DEFAULT 'standard',
  health_score INTEGER DEFAULT 0,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'churned')),
  CONSTRAINT valid_tier CHECK (tier IN ('enterprise', 'mid-market', 'smb')),
  CONSTRAINT valid_client_type CHECK (client_type IN ('standard', 'strategic', 'startup'))
);

-- Associates (Team Members)
CREATE TABLE associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  level VARCHAR(50), -- e.g., Junior, Senior, Lead, Principal
  availability VARCHAR(30) DEFAULT 'available',
  max_capacity INTEGER DEFAULT 5,
  active_projects INTEGER DEFAULT 0,
  hourly_cost DECIMAL(10,2), -- Internal cost rate
  default_daily_rate DECIMAL(10,2), -- Default billing rate
  skills JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  start_date DATE,
  manager_id UUID REFERENCES associates(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_availability CHECK (availability IN ('available', 'partially-available', 'unavailable', 'on-leave'))
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'Onboarding',
  lifecycle VARCHAR(30) DEFAULT 'onboarding',
  health VARCHAR(30) DEFAULT 'on-track',
  owner_id UUID REFERENCES associates(id) ON DELETE SET NULL,
  due_date DATE,
  start_date DATE,
  actual_end_date DATE,
  budget DECIMAL(15,2),
  budget_currency VARCHAR(3) DEFAULT 'USD',
  milestones_progress INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  priority VARCHAR(10) DEFAULT 'medium',
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('Onboarding', 'Execution', 'Blocked', 'Closed', 'On Hold')),
  CONSTRAINT valid_lifecycle CHECK (lifecycle IN ('new-business', 'onboarding', 'execution', 'closure', 'learnings')),
  CONSTRAINT valid_health CHECK (health IN ('on-track', 'at-risk', 'critical-risk')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Project Assigned Associates (Many-to-Many)
CREATE TABLE project_associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  role VARCHAR(100), -- Role on this specific project
  allocation_percentage INTEGER DEFAULT 100,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, associate_id)
);

-- Milestones (Phases)
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  due_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(20) DEFAULT 'not-started',
  completion INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  blockers JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked', 'on-hold')),
  CONSTRAINT valid_completion CHECK (completion >= 0 AND completion <= 100)
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES associates(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  time_started TIMESTAMP,
  time_completed TIMESTAMP,
  cycle_time INTEGER, -- Days to complete
  sort_order INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- For subtasks
  tags JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in-progress', 'review', 'done', 'blocked')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Task Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PRICING TABLES
-- =====================================================

-- Project Pricing (Main pricing record)
CREATE TABLE project_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(20) DEFAULT 'not-priced',
  currency VARCHAR(3) DEFAULT 'USD',
  markup_percentage DECIMAL(5,2) DEFAULT 50.00,
  withholding_tax_percentage DECIMAL(5,2) DEFAULT 5.00,
  default_accommodation DECIMAL(10,2) DEFAULT 275.00,
  default_per_diem DECIMAL(10,2) DEFAULT 80.00,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  discount_reason TEXT,
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('not-priced', 'in-progress', 'pending-approval', 'priced', 'locked')),
  CONSTRAINT valid_currency CHECK (currency IN ('USD', 'SAR', 'AED', 'EUR', 'GBP'))
);

-- Milestone Pricing (Links milestone to pricing)
CREATE TABLE milestone_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_pricing_id UUID REFERENCES project_pricing(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_pricing_id, milestone_id)
);

-- Task Pricing (Time unit and period settings per task)
CREATE TABLE task_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_pricing_id UUID REFERENCES milestone_pricing(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  time_unit VARCHAR(10) DEFAULT 'full',
  number_of_periods INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(milestone_pricing_id, task_id),
  CONSTRAINT valid_time_unit CHECK (time_unit IN ('full', 'week', 'month'))
);

-- Task Assignees (Team members assigned with days)
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_pricing_id UUID REFERENCES task_pricing(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  days DECIMAL(10,2) DEFAULT 0,
  days_per_period DECIMAL(10,2) DEFAULT 0,
  is_lead BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(task_pricing_id, associate_id)
);

-- Associate Rates (Per-project rates)
CREATE TABLE associate_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_pricing_id UUID REFERENCES project_pricing(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  base_rate DECIMAL(10,2) NOT NULL,
  marked_up_rate DECIMAL(10,2) NOT NULL,
  rate_type VARCHAR(20) DEFAULT 'daily', -- daily, hourly
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_pricing_id, associate_id)
);

-- Expense Items (Travel and expenses per associate)
CREATE TABLE expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_pricing_id UUID REFERENCES project_pricing(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  number_of_flights INTEGER DEFAULT 0,
  avg_flight_cost DECIMAL(10,2) DEFAULT 0,
  days_onsite INTEGER DEFAULT 0,
  accommodation_per_day DECIMAL(10,2),
  per_diem_per_day DECIMAL(10,2),
  ground_transport DECIMAL(10,2) DEFAULT 0,
  other_expenses DECIMAL(10,2) DEFAULT 0,
  expense_buffer DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_pricing_id, associate_id)
);

-- =====================================================
-- AUDIT & HISTORY TABLES
-- =====================================================

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  INDEX idx_audit_table_record (table_name, record_id),
  INDEX idx_audit_changed_by (changed_by),
  INDEX idx_audit_changed_at (changed_at)
);

-- Pricing History (for tracking pricing changes)
CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_pricing_id UUID REFERENCES project_pricing(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL, -- Complete pricing snapshot
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_lifecycle ON projects(lifecycle);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_pricing_milestone ON task_pricing(milestone_pricing_id);
CREATE INDEX idx_task_assignees_task ON task_assignees(task_pricing_id);
CREATE INDEX idx_task_assignees_associate ON task_assignees(associate_id);
CREATE INDEX idx_project_pricing_project ON project_pricing(project_id);
CREATE INDEX idx_associate_rates_project ON associate_rates(project_pricing_id);
CREATE INDEX idx_expense_items_project ON expense_items(project_pricing_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_associates_email ON associates(email);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_project_milestone ON tasks(project_id, milestone_id);
CREATE INDEX idx_task_assignees_associate_days ON task_assignees(associate_id, days);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Project Resource Summary
CREATE OR REPLACE VIEW v_project_resource_summary AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.status,
  p.lifecycle,
  c.name AS client_name,
  o.name AS owner_name,
  COUNT(DISTINCT m.id) AS milestone_count,
  COUNT(DISTINCT t.id) AS task_count,
  COUNT(DISTINCT ta.associate_id) AS team_member_count,
  COALESCE(SUM(ta.days), 0) AS total_days,
  pp.status AS pricing_status,
  pp.currency
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
LEFT JOIN associates o ON o.id = p.owner_id
LEFT JOIN milestones m ON m.project_id = p.id
LEFT JOIN tasks t ON t.milestone_id = m.id
LEFT JOIN project_pricing pp ON pp.project_id = p.id
LEFT JOIN milestone_pricing mp ON mp.project_pricing_id = pp.id AND mp.milestone_id = m.id
LEFT JOIN task_pricing tp ON tp.milestone_pricing_id = mp.id AND tp.task_id = t.id
LEFT JOIN task_assignees ta ON ta.task_pricing_id = tp.id
GROUP BY p.id, p.name, p.status, p.lifecycle, c.name, o.name, pp.status, pp.currency;

-- View: Associate Workload
CREATE OR REPLACE VIEW v_associate_workload AS
SELECT 
  a.id AS associate_id,
  a.name AS associate_name,
  a.role,
  a.department,
  COUNT(DISTINCT p.id) AS project_count,
  COALESCE(SUM(ta.days), 0) AS total_days_assigned,
  COUNT(DISTINCT CASE WHEN ta.is_lead THEN tp.task_id END) AS tasks_as_lead,
  a.availability,
  a.max_capacity
FROM associates a
LEFT JOIN task_assignees ta ON ta.associate_id = a.id
LEFT JOIN task_pricing tp ON tp.id = ta.task_pricing_id
LEFT JOIN milestone_pricing mp ON mp.id = tp.milestone_pricing_id
LEFT JOIN project_pricing pp ON pp.id = mp.project_pricing_id
LEFT JOIN projects p ON p.id = pp.project_id
GROUP BY a.id, a.name, a.role, a.department, a.availability, a.max_capacity;

-- View: Pricing Summary by Project
CREATE OR REPLACE VIEW v_pricing_summary AS
SELECT
  pp.id AS pricing_id,
  pp.project_id,
  p.name AS project_name,
  pp.status,
  pp.currency,
  pp.markup_percentage,
  COALESCE(SUM(ta.days * ar.marked_up_rate), 0) AS total_resource_cost,
  COALESCE(SUM(
    (COALESCE(ei.number_of_flights, 0) * COALESCE(ei.avg_flight_cost, 0)) +
    (COALESCE(ei.days_onsite, 0) * COALESCE(ei.accommodation_per_day, pp.default_accommodation)) +
    (COALESCE(ei.days_onsite, 0) * COALESCE(ei.per_diem_per_day, pp.default_per_diem)) +
    COALESCE(ei.expense_buffer, 0)
  ), 0) AS total_expenses
FROM project_pricing pp
JOIN projects p ON p.id = pp.project_id
LEFT JOIN milestone_pricing mp ON mp.project_pricing_id = pp.id
LEFT JOIN task_pricing tp ON tp.milestone_pricing_id = mp.id
LEFT JOIN task_assignees ta ON ta.task_pricing_id = tp.id
LEFT JOIN associate_rates ar ON ar.project_pricing_id = pp.id AND ar.associate_id = ta.associate_id
LEFT JOIN expense_items ei ON ei.project_pricing_id = pp.id AND ei.associate_id = ta.associate_id
GROUP BY pp.id, pp.project_id, p.name, pp.status, pp.currency, pp.markup_percentage;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_associates_updated_at BEFORE UPDATE ON associates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_project_pricing_updated_at BEFORE UPDATE ON project_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_task_pricing_updated_at BEFORE UPDATE ON task_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_task_assignees_updated_at BEFORE UPDATE ON task_assignees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_associate_rates_updated_at BEFORE UPDATE ON associate_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_expense_items_updated_at BEFORE UPDATE ON expense_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-calculate days for task assignees
CREATE OR REPLACE FUNCTION calculate_assignee_days()
RETURNS TRIGGER AS $$
DECLARE
  v_time_unit VARCHAR(10);
  v_periods INTEGER;
BEGIN
  -- Get task pricing settings
  SELECT time_unit, number_of_periods 
  INTO v_time_unit, v_periods
  FROM task_pricing 
  WHERE id = NEW.task_pricing_id;
  
  -- Calculate total days based on time unit
  IF v_time_unit = 'full' THEN
    -- Days entered directly, no calculation needed
    NULL;
  ELSE
    -- Calculate: days_per_period * number_of_periods
    NEW.days = COALESCE(NEW.days_per_period, 0) * COALESCE(v_periods, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_assignee_days
BEFORE INSERT OR UPDATE ON task_assignees
FOR EACH ROW EXECUTE FUNCTION calculate_assignee_days();

-- Function to update milestone completion percentage
CREATE OR REPLACE FUNCTION update_milestone_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_milestone_id UUID;
  v_total_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_completion INTEGER;
BEGIN
  -- Get milestone_id
  IF TG_OP = 'DELETE' THEN
    v_milestone_id = OLD.milestone_id;
  ELSE
    v_milestone_id = NEW.milestone_id;
  END IF;
  
  -- Calculate completion
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'done')
  INTO v_total_tasks, v_completed_tasks
  FROM tasks
  WHERE milestone_id = v_milestone_id;
  
  IF v_total_tasks > 0 THEN
    v_completion = (v_completed_tasks * 100) / v_total_tasks;
  ELSE
    v_completion = 0;
  END IF;
  
  -- Update milestone
  UPDATE milestones
  SET completion = v_completion,
      status = CASE 
        WHEN v_completion = 100 THEN 'completed'
        WHEN v_completion > 0 THEN 'in-progress'
        ELSE 'not-started'
      END
  WHERE id = v_milestone_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_milestone_completion
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_milestone_completion();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: ELT and Association Managers can see all projects
CREATE POLICY projects_elt_full_access ON projects
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('elt', 'association-manager')
  )
);

-- Policy: Engagement leads can see projects they own
CREATE POLICY projects_owner_access ON projects
FOR ALL
TO authenticated
USING (
  owner_id = (SELECT associate_id FROM users WHERE id = auth.uid())
);

-- Policy: Associates can see projects they're assigned to
CREATE POLICY projects_assigned_access ON projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_associates pa
    JOIN users u ON u.associate_id = pa.associate_id
    WHERE pa.project_id = projects.id
    AND u.id = auth.uid()
  )
);

-- Similar policies for other tables...
```

### 3.3 TypeScript Interfaces

```typescript
// =====================================================
// CORE TYPES
// =====================================================

export type UUID = string;
export type ISO8601 = string; // Date string in ISO 8601 format

export type UserRole = 'elt' | 'association-manager' | 'engagement-lead' | 'associate';
export type ProjectStatus = 'Onboarding' | 'Execution' | 'Blocked' | 'Closed' | 'On Hold';
export type ProjectLifecycle = 'new-business' | 'onboarding' | 'execution' | 'closure' | 'learnings';
export type ProjectHealth = 'on-track' | 'at-risk' | 'critical-risk';
export type MilestoneStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TimeUnit = 'full' | 'week' | 'month';
export type Currency = 'USD' | 'SAR' | 'AED' | 'EUR' | 'GBP';
export type PricingStatus = 'not-priced' | 'in-progress' | 'pending-approval' | 'priced' | 'locked';
export type Availability = 'available' | 'partially-available' | 'unavailable' | 'on-leave';

// =====================================================
// USER & AUTH
// =====================================================

export interface User {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  associateId?: UUID;
  isActive: boolean;
  lastLogin?: ISO8601;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface Session {
  id: UUID;
  userId: UUID;
  tokenHash: string;
  expiresAt: ISO8601;
  ipAddress?: string;
  userAgent?: string;
  createdAt: ISO8601;
}

// =====================================================
// CLIENT
// =====================================================

export interface Client {
  id: UUID;
  name: string;
  logo?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'churned';
  tier: 'enterprise' | 'mid-market' | 'smb';
  clientType: 'standard' | 'strategic' | 'startup';
  healthScore: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  createdBy?: UUID;
}

// =====================================================
// ASSOCIATE
// =====================================================

export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Associate {
  id: UUID;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  level?: string;
  availability: Availability;
  maxCapacity: number;
  activeProjects: number;
  hourlyCost?: number;
  defaultDailyRate?: number;
  skills: Skill[];
  certifications: string[];
  startDate?: ISO8601;
  managerId?: UUID;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

// =====================================================
// PROJECT
// =====================================================

export interface Project {
  id: UUID;
  name: string;
  description?: string;
  clientId?: UUID;
  status: ProjectStatus;
  lifecycle: ProjectLifecycle;
  health: ProjectHealth;
  ownerId?: UUID;
  dueDate?: ISO8601;
  startDate?: ISO8601;
  actualEndDate?: ISO8601;
  budget?: number;
  budgetCurrency: Currency;
  milestonesProgress: number;
  riskScore: number;
  priority: Priority;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  createdBy?: UUID;
  
  // Relationships (populated by joins)
  client?: Client;
  owner?: Associate;
  milestones?: Milestone[];
  assignedAssociates?: Associate[];
}

export interface ProjectAssociate {
  id: UUID;
  projectId: UUID;
  associateId: UUID;
  role?: string;
  allocationPercentage: number;
  startDate?: ISO8601;
  endDate?: ISO8601;
  createdAt: ISO8601;
  
  // Populated
  associate?: Associate;
}

// =====================================================
// MILESTONE
// =====================================================

export interface Milestone {
  id: UUID;
  projectId: UUID;
  title: string;
  description?: string;
  startDate?: ISO8601;
  dueDate?: ISO8601;
  actualStartDate?: ISO8601;
  actualEndDate?: ISO8601;
  status: MilestoneStatus;
  completion: number;
  sortOrder: number;
  blockers: string[];
  deliverables: string[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Relationships
  tasks?: Task[];
}

// =====================================================
// TASK
// =====================================================

export interface Task {
  id: UUID;
  projectId: UUID;
  milestoneId: UUID;
  title: string;
  description?: string;
  assigneeId?: UUID;
  status: TaskStatus;
  priority: Priority;
  dueDate?: ISO8601;
  estimatedHours?: number;
  actualHours?: number;
  timeStarted?: ISO8601;
  timeCompleted?: ISO8601;
  cycleTime?: number;
  sortOrder: number;
  parentTaskId?: UUID;
  tags: string[];
  attachments: string[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
  createdBy?: UUID;
  
  // Relationships
  assignee?: Associate;
  subtasks?: Task[];
}

// =====================================================
// PRICING
// =====================================================

export interface ProjectPricing {
  id: UUID;
  projectId: UUID;
  status: PricingStatus;
  currency: Currency;
  markupPercentage: number;
  withholdingTaxPercentage: number;
  defaultAccommodation: number;
  defaultPerDiem: number;
  discountPercentage: number;
  discountReason?: string;
  notes?: string;
  approvedBy?: UUID;
  approvedAt?: ISO8601;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Relationships
  milestonePricing?: MilestonePricing[];
  associateRates?: AssociateRate[];
  expenses?: ExpenseItem[];
}

export interface MilestonePricing {
  id: UUID;
  projectPricingId: UUID;
  milestoneId: UUID;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Relationships
  tasks?: TaskPricing[];
}

export interface TaskPricing {
  id: UUID;
  milestonePricingId: UUID;
  taskId: UUID;
  timeUnit: TimeUnit;
  numberOfPeriods: number;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Relationships
  assignees?: TaskAssignee[];
}

export interface TaskAssignee {
  id: UUID;
  taskPricingId: UUID;
  associateId: UUID;
  days: number;
  daysPerPeriod: number;
  isLead: boolean;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Populated
  associate?: Associate;
}

export interface AssociateRate {
  id: UUID;
  projectPricingId: UUID;
  associateId: UUID;
  baseRate: number;
  markedUpRate: number;
  rateType: 'daily' | 'hourly';
  effectiveDate?: ISO8601;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Populated
  associate?: Associate;
}

export interface ExpenseItem {
  id: UUID;
  projectPricingId: UUID;
  associateId: UUID;
  numberOfFlights: number;
  avgFlightCost: number;
  daysOnsite: number;
  accommodationPerDay?: number;
  perDiemPerDay?: number;
  groundTransport: number;
  otherExpenses: number;
  expenseBuffer: number;
  notes?: string;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Populated
  associate?: Associate;
}
```

---

## 4. API Endpoints Specification

### 4.1 API Overview

| Method | Endpoint | Description | Auth Required | Permissions |
|--------|----------|-------------|---------------|-------------|
| **Projects** ||||
| GET | `/api/projects` | List all projects | Yes | Based on role |
| GET | `/api/projects/:id` | Get project details | Yes | Project access |
| POST | `/api/projects` | Create project | Yes | createProject |
| PUT | `/api/projects/:id` | Update project | Yes | editProject |
| DELETE | `/api/projects/:id` | Delete project | Yes | deleteProject |
| **Milestones** ||||
| GET | `/api/projects/:projectId/milestones` | List milestones | Yes | Project access |
| POST | `/api/projects/:projectId/milestones` | Create milestone | Yes | editProject |
| PUT | `/api/milestones/:id` | Update milestone | Yes | editProject |
| DELETE | `/api/milestones/:id` | Delete milestone | Yes | editProject |
| **Tasks** ||||
| GET | `/api/milestones/:milestoneId/tasks` | List tasks | Yes | Project access |
| POST | `/api/milestones/:milestoneId/tasks` | Create task | Yes | editProject |
| PUT | `/api/tasks/:id` | Update task | Yes | editProject |
| DELETE | `/api/tasks/:id` | Delete task | Yes | editProject |
| **Pricing** ||||
| GET | `/api/projects/:projectId/pricing` | Get project pricing | Yes | calculator |
| PUT | `/api/projects/:projectId/pricing` | Update pricing settings | Yes | calculator |
| POST | `/api/pricing/:pricingId/task-assignees` | Add task assignee | Yes | calculator |
| PUT | `/api/task-assignees/:id` | Update assignee | Yes | calculator |
| DELETE | `/api/task-assignees/:id` | Remove assignee | Yes | calculator |
| **Associates** ||||
| GET | `/api/associates` | List all associates | Yes | associates |
| GET | `/api/associates/:id` | Get associate details | Yes | associates |
| GET | `/api/associates/:id/workload` | Get associate workload | Yes | associates |

### 4.2 Detailed Endpoint Specifications

#### 4.2.1 Projects

##### GET /api/projects

List all projects with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| status | string | No | Filter by status |
| lifecycle | string | No | Filter by lifecycle stage |
| health | string | No | Filter by health status |
| clientId | UUID | No | Filter by client |
| ownerId | UUID | No | Filter by owner |
| search | string | No | Search in name/description |
| sortBy | string | No | Sort field (default: createdAt) |
| sortOrder | 'asc' \| 'desc' | No | Sort order (default: desc) |

**Request:**
```http
GET /api/projects?page=1&limit=20&status=Execution&lifecycle=execution
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Acme Corp Digital Transformation",
        "description": "Enterprise-wide digital transformation initiative",
        "clientId": "550e8400-e29b-41d4-a716-446655440001",
        "status": "Execution",
        "lifecycle": "execution",
        "health": "on-track",
        "ownerId": "550e8400-e29b-41d4-a716-446655440002",
        "dueDate": "2026-06-30",
        "milestonesProgress": 45,
        "createdAt": "2026-01-15T10:00:00Z",
        "updatedAt": "2026-01-20T14:30:00Z",
        "client": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Acme Corporation",
          "logo": "/logos/acme.png"
        },
        "owner": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Sarah Johnson",
          "avatar": "/avatars/sarah.jpg"
        },
        "_counts": {
          "milestones": 4,
          "tasks": 24,
          "assignedAssociates": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Implementation:**

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission, getProjectFilter } from '@/lib/permissions';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['Onboarding', 'Execution', 'Blocked', 'Closed', 'On Hold']).optional(),
  lifecycle: z.enum(['new-business', 'onboarding', 'execution', 'closure', 'learnings']).optional(),
  health: z.enum(['on-track', 'at-risk', 'critical-risk']).optional(),
  clientId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'dueDate', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // 2. Check permission
    if (!hasPermission(session.user, 'projects')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // 3. Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    // 4. Build query with role-based filtering
    const roleFilter = getProjectFilter(session.user);
    const offset = (query.page - 1) * query.limit;

    // 5. Execute query
    const [projects, countResult] = await Promise.all([
      db.query(`
        SELECT 
          p.*,
          row_to_json(c.*) as client,
          row_to_json(o.*) as owner,
          json_build_object(
            'milestones', (SELECT COUNT(*) FROM milestones WHERE project_id = p.id),
            'tasks', (SELECT COUNT(*) FROM tasks WHERE project_id = p.id),
            'assignedAssociates', (SELECT COUNT(*) FROM project_associates WHERE project_id = p.id)
          ) as _counts
        FROM projects p
        LEFT JOIN clients c ON c.id = p.client_id
        LEFT JOIN associates o ON o.id = p.owner_id
        WHERE 1=1
          ${roleFilter}
          ${query.status ? 'AND p.status = $1' : ''}
          ${query.lifecycle ? 'AND p.lifecycle = $2' : ''}
          ${query.health ? 'AND p.health = $3' : ''}
          ${query.clientId ? 'AND p.client_id = $4' : ''}
          ${query.ownerId ? 'AND p.owner_id = $5' : ''}
          ${query.search ? "AND (p.name ILIKE $6 OR p.description ILIKE $6)" : ''}
        ORDER BY p.${query.sortBy} ${query.sortOrder}
        LIMIT $7 OFFSET $8
      `, [
        query.status,
        query.lifecycle,
        query.health,
        query.clientId,
        query.ownerId,
        query.search ? `%${query.search}%` : null,
        query.limit,
        offset
      ]),
      db.query(`SELECT COUNT(*) FROM projects p WHERE 1=1 ${roleFilter}`)
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / query.limit);

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: {
        items: projects.rows,
        pagination: {
          page: query.page,
          limit: query.limit,
          totalItems,
          totalPages,
          hasNextPage: query.page < totalPages,
          hasPrevPage: query.page > 1,
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters', details: error.errors } },
        { status: 400 }
      );
    }
    
    console.error('[API] GET /projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
```

##### POST /api/projects

Create a new project.

**Request Body:**
```json
{
  "name": "New Project Name",
  "description": "Project description",
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "ownerId": "550e8400-e29b-41d4-a716-446655440002",
  "dueDate": "2026-12-31",
  "startDate": "2026-02-01",
  "budget": 150000,
  "budgetCurrency": "USD",
  "lifecycle": "onboarding",
  "priority": "high",
  "tags": ["digital", "transformation"]
}
```

**Validation Schema:**
```typescript
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  clientId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  budgetCurrency: z.enum(['USD', 'SAR', 'AED', 'EUR', 'GBP']).default('USD'),
  lifecycle: z.enum(['new-business', 'onboarding', 'execution', 'closure', 'learnings']).default('onboarding'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string().max(50)).max(10).default([]),
});
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440099",
    "name": "New Project Name",
    "status": "Onboarding",
    "lifecycle": "onboarding",
    "health": "on-track",
    "createdAt": "2026-01-22T10:00:00Z"
  }
}
```

##### PUT /api/projects/:id

Update an existing project.

**Request:**
```http
PUT /api/projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "status": "Execution",
  "health": "at-risk"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Project Name",
    "status": "Execution",
    "health": "at-risk",
    "updatedAt": "2026-01-22T15:30:00Z"
  }
}
```

##### DELETE /api/projects/:id

Delete a project (soft delete or cascade based on configuration).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

#### 4.2.2 Milestones

##### GET /api/projects/:projectId/milestones

Get all milestones for a project with their tasks.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "m1-p1",
      "projectId": "p1",
      "title": "Phase 1: Discovery & Planning",
      "description": "Initial discovery and project planning phase",
      "startDate": "2026-01-20",
      "dueDate": "2026-02-15",
      "status": "in-progress",
      "completion": 60,
      "sortOrder": 0,
      "blockers": [],
      "deliverables": ["Project Charter", "Requirements Doc"],
      "tasks": [
        {
          "id": "t1-m1",
          "title": "Stakeholder Interviews",
          "status": "done",
          "priority": "high",
          "dueDate": "2026-01-25",
          "assignee": {
            "id": "a1",
            "name": "Sarah Johnson"
          }
        }
      ],
      "_pricing": {
        "totalDays": 42,
        "teamMemberCount": 4
      }
    }
  ]
}
```

##### POST /api/projects/:projectId/milestones

Create a new milestone.

**Request Body:**
```json
{
  "title": "Phase 2: Implementation",
  "description": "Main implementation phase",
  "startDate": "2026-02-16",
  "dueDate": "2026-04-15",
  "deliverables": ["MVP Release", "User Documentation"]
}
```

**Implementation:**
```typescript
// app/api/projects/[projectId]/milestones/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return unauthorized();
    }

    // Verify project access
    const project = await getProject(params.projectId);
    if (!project || !canEditProject(session.user, project)) {
      return forbidden();
    }

    // Validate body
    const body = await request.json();
    const data = createMilestoneSchema.parse(body);

    // Get next sort order
    const { rows: [lastMilestone] } = await db.query(
      'SELECT MAX(sort_order) as max_order FROM milestones WHERE project_id = $1',
      [params.projectId]
    );
    const sortOrder = (lastMilestone?.max_order || 0) + 1;

    // Create milestone
    const { rows: [milestone] } = await db.query(`
      INSERT INTO milestones (project_id, title, description, start_date, due_date, deliverables, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      params.projectId,
      data.title,
      data.description,
      data.startDate,
      data.dueDate,
      JSON.stringify(data.deliverables || []),
      sortOrder
    ]);

    // Initialize milestone pricing if project has pricing
    const { rows: [projectPricing] } = await db.query(
      'SELECT id FROM project_pricing WHERE project_id = $1',
      [params.projectId]
    );
    
    if (projectPricing) {
      await db.query(`
        INSERT INTO milestone_pricing (project_pricing_id, milestone_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [projectPricing.id, milestone.id]);
    }

    // Log audit
    await logAudit('milestones', milestone.id, 'INSERT', null, milestone, session.user.id);

    return NextResponse.json({ success: true, data: milestone }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}
```

---

#### 4.2.3 Tasks

##### POST /api/milestones/:milestoneId/tasks

Create a new task within a milestone.

**Request Body:**
```json
{
  "title": "Design System Architecture",
  "description": "Create technical architecture documentation",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440002",
  "priority": "high",
  "dueDate": "2026-02-01",
  "estimatedHours": 24,
  "tags": ["architecture", "documentation"]
}
```

##### PUT /api/tasks/:id

Update a task.

**Request Body (Partial Update):**
```json
{
  "status": "in-progress",
  "timeStarted": "2026-01-22T09:00:00Z"
}
```

**Business Logic:**
- When status changes to "in-progress", set `timeStarted` if not already set
- When status changes to "done", set `timeCompleted` and calculate `cycleTime`
- Trigger milestone completion recalculation

---

#### 4.2.4 Pricing

##### GET /api/projects/:projectId/pricing

Get complete pricing data for a project.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "pp-001",
    "projectId": "p1",
    "status": "priced",
    "currency": "USD",
    "markupPercentage": 50,
    "withholdingTaxPercentage": 5,
    "defaultAccommodation": 275,
    "defaultPerDiem": 80,
    "discountPercentage": 0,
    "milestonePricing": [
      {
        "id": "mp-001",
        "milestoneId": "m1-p1",
        "milestone": {
          "id": "m1-p1",
          "title": "Phase 1: Discovery & Planning"
        },
        "tasks": [
          {
            "id": "tp-001",
            "taskId": "t1-m1",
            "task": {
              "id": "t1-m1",
              "title": "Stakeholder Interviews"
            },
            "timeUnit": "week",
            "numberOfPeriods": 2,
            "assignees": [
              {
                "id": "ta-001",
                "associateId": "a1",
                "associate": {
                  "id": "a1",
                  "name": "Sarah Johnson",
                  "role": "Senior Consultant"
                },
                "days": 4,
                "daysPerPeriod": 2,
                "isLead": true
              }
            ]
          }
        ]
      }
    ],
    "associateRates": [
      {
        "id": "ar-001",
        "associateId": "a1",
        "associate": {
          "id": "a1",
          "name": "Sarah Johnson"
        },
        "baseRate": 1200,
        "markedUpRate": 1800
      }
    ],
    "expenses": [
      {
        "id": "ei-001",
        "associateId": "a1",
        "numberOfFlights": 2,
        "avgFlightCost": 500,
        "daysOnsite": 10,
        "accommodationPerDay": 275,
        "perDiemPerDay": 80,
        "expenseBuffer": 200
      }
    ],
    "_calculated": {
      "totalResourceCost": 45600,
      "totalExpenses": 4750,
      "subtotal": 50350,
      "withholdingTax": 2517.50,
      "grandTotal": 52867.50,
      "totalDays": 128,
      "teamMemberCount": 6
    }
  }
}
```

##### PUT /api/projects/:projectId/pricing

Update pricing settings.

**Request Body:**
```json
{
  "currency": "SAR",
  "markupPercentage": 55,
  "defaultAccommodation": 300,
  "status": "in-progress"
}
```

##### POST /api/pricing/task-assignees

Add a team member to a task pricing.

**Request Body:**
```json
{
  "projectId": "p1",
  "milestoneId": "m1-p1",
  "taskId": "t1-m1",
  "associateId": "a3",
  "daysPerPeriod": 3
}
```

**Implementation:**
```typescript
// app/api/pricing/task-assignees/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.user, 'calculator')) {
      return unauthorized();
    }

    const body = await request.json();
    const data = addTaskAssigneeSchema.parse(body);

    // Get or create pricing hierarchy
    const projectPricingId = await ensureProjectPricing(data.projectId);
    const milestonePricingId = await ensureMilestonePricing(projectPricingId, data.milestoneId);
    const taskPricingId = await ensureTaskPricing(milestonePricingId, data.taskId);

    // Check if this is the first assignee (will be lead)
    const { rows: existingAssignees } = await db.query(
      'SELECT COUNT(*) as count FROM task_assignees WHERE task_pricing_id = $1',
      [taskPricingId]
    );
    const isFirstAssignee = parseInt(existingAssignees[0].count) === 0;

    // Get task pricing settings for day calculation
    const { rows: [taskPricing] } = await db.query(
      'SELECT time_unit, number_of_periods FROM task_pricing WHERE id = $1',
      [taskPricingId]
    );

    // Calculate total days
    let days = 0;
    if (taskPricing.time_unit !== 'full' && data.daysPerPeriod) {
      days = data.daysPerPeriod * (taskPricing.number_of_periods || 0);
    }

    // Insert assignee
    const { rows: [assignee] } = await db.query(`
      INSERT INTO task_assignees (task_pricing_id, associate_id, days, days_per_period, is_lead)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (task_pricing_id, associate_id) DO UPDATE
      SET days = EXCLUDED.days, days_per_period = EXCLUDED.days_per_period
      RETURNING *
    `, [taskPricingId, data.associateId, days, data.daysPerPeriod || 0, isFirstAssignee]);

    // Ensure associate rate exists
    await ensureAssociateRate(projectPricingId, data.associateId);

    // Update pricing status
    await db.query(
      "UPDATE project_pricing SET status = 'in-progress', updated_at = NOW() WHERE id = $1",
      [projectPricingId]
    );

    // Invalidate cache
    await invalidateCache(`pricing:${data.projectId}`);

    return NextResponse.json({ success: true, data: assignee }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}
```

##### PUT /api/task-assignees/:id

Update task assignee days.

**Request Body:**
```json
{
  "days": 8,
  "daysPerPeriod": 4
}
```

##### PUT /api/pricing/task-settings

Update task time unit settings (recalculates all assignee days).

**Request Body:**
```json
{
  "projectId": "p1",
  "milestoneId": "m1-p1",
  "taskId": "t1-m1",
  "timeUnit": "month",
  "numberOfPeriods": 2
}
```

**Implementation:**
```typescript
// app/api/pricing/task-settings/route.ts
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.user, 'calculator')) {
      return unauthorized();
    }

    const body = await request.json();
    const { projectId, milestoneId, taskId, timeUnit, numberOfPeriods } = body;

    // Get task pricing
    const taskPricingId = await getTaskPricingId(projectId, milestoneId, taskId);
    if (!taskPricingId) {
      return notFound('Task pricing not found');
    }

    // Begin transaction
    await db.query('BEGIN');

    try {
      // Update task pricing settings
      await db.query(`
        UPDATE task_pricing 
        SET time_unit = $1, number_of_periods = $2, updated_at = NOW()
        WHERE id = $3
      `, [timeUnit, numberOfPeriods, taskPricingId]);

      // Recalculate all assignee days if not 'full'
      if (timeUnit !== 'full') {
        await db.query(`
          UPDATE task_assignees
          SET days = days_per_period * $1, updated_at = NOW()
          WHERE task_pricing_id = $2
        `, [numberOfPeriods || 0, taskPricingId]);
      }

      await db.query('COMMIT');

      // Invalidate cache
      await invalidateCache(`pricing:${projectId}`);

      return NextResponse.json({ success: true });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    return handleError(error);
  }
}
```

---

## 5. Data Flow & Business Logic

### 5.1 Time Unit Calculation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TIME UNIT CALCULATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User selects time unit                                                  │
│        │                                                                 │
│        ▼                                                                 │
│  ┌─────────────────┐                                                    │
│  │ timeUnit = ?    │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│     ┌─────┴─────┬─────────────────┐                                     │
│     │           │                 │                                      │
│     ▼           ▼                 ▼                                      │
│  ┌──────┐   ┌──────┐         ┌──────┐                                   │
│  │ full │   │ week │         │month │                                   │
│  └──┬───┘   └──┬───┘         └──┬───┘                                   │
│     │          │                │                                        │
│     │          │                │                                        │
│     ▼          ▼                ▼                                        │
│  User enters   User enters      User enters                              │
│  total days    days/week +      days/month +                            │
│  directly      # weeks          # months                                 │
│     │          │                │                                        │
│     │          │                │                                        │
│     ▼          ▼                ▼                                        │
│  days = input  days = days/wk   days = days/mo                          │
│                × weeks          × months                                 │
│     │          │                │                                        │
│     └──────────┴────────────────┘                                       │
│                │                                                         │
│                ▼                                                         │
│         Store in DB:                                                     │
│         - task_pricing.time_unit                                        │
│         - task_pricing.number_of_periods                                │
│         - task_assignees.days (calculated)                              │
│         - task_assignees.days_per_period                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Pricing Calculation Service

```typescript
// lib/services/pricing-calculation.service.ts

export interface PricingCalculationResult {
  totalResourceCost: number;
  totalExpenses: number;
  subtotal: number;
  withholdingTax: number;
  discount: number;
  grandTotal: number;
  totalDays: number;
  teamMemberCount: number;
  byAssociate: AssociatePricingBreakdown[];
  byMilestone: MilestonePricingBreakdown[];
}

export interface AssociatePricingBreakdown {
  associateId: string;
  associateName: string;
  days: number;
  rate: number;
  resourceCost: number;
  expenses: number;
  total: number;
}

export interface MilestonePricingBreakdown {
  milestoneId: string;
  milestoneTitle: string;
  totalDays: number;
  resourceCost: number;
  teamMembers: string[];
}

export class PricingCalculationService {
  
  async calculateProjectPricing(projectId: string): Promise<PricingCalculationResult> {
    // 1. Get all pricing data
    const pricing = await this.getProjectPricingData(projectId);
    if (!pricing) {
      return this.emptyResult();
    }

    // 2. Calculate by associate
    const associateBreakdowns: AssociatePricingBreakdown[] = [];
    const associateDaysMap = new Map<string, number>();
    const teamMemberSet = new Set<string>();

    // Collect all assignee days
    for (const mp of pricing.milestonePricing || []) {
      for (const tp of mp.tasks || []) {
        for (const assignee of tp.assignees || []) {
          teamMemberSet.add(assignee.associateId);
          const currentDays = associateDaysMap.get(assignee.associateId) || 0;
          associateDaysMap.set(assignee.associateId, currentDays + (assignee.days || 0));
        }
      }
    }

    // Calculate costs per associate
    let totalResourceCost = 0;
    let totalExpenses = 0;
    let totalDays = 0;

    for (const [associateId, days] of associateDaysMap) {
      const rate = pricing.associateRates?.find(r => r.associateId === associateId);
      const expense = pricing.expenses?.find(e => e.associateId === associateId);
      const associate = await this.getAssociate(associateId);

      const resourceCost = days * (rate?.markedUpRate || 0);
      const expenseCost = this.calculateExpenseCost(expense, pricing);

      totalResourceCost += resourceCost;
      totalExpenses += expenseCost;
      totalDays += days;

      associateBreakdowns.push({
        associateId,
        associateName: associate?.name || 'Unknown',
        days,
        rate: rate?.markedUpRate || 0,
        resourceCost,
        expenses: expenseCost,
        total: resourceCost + expenseCost,
      });
    }

    // 3. Calculate by milestone
    const milestoneBreakdowns: MilestonePricingBreakdown[] = [];
    for (const mp of pricing.milestonePricing || []) {
      const milestone = await this.getMilestone(mp.milestoneId);
      let milestoneDays = 0;
      let milestoneResourceCost = 0;
      const milestoneTeamMembers = new Set<string>();

      for (const tp of mp.tasks || []) {
        for (const assignee of tp.assignees || []) {
          milestoneDays += assignee.days || 0;
          milestoneTeamMembers.add(assignee.associateId);
          const rate = pricing.associateRates?.find(r => r.associateId === assignee.associateId);
          milestoneResourceCost += (assignee.days || 0) * (rate?.markedUpRate || 0);
        }
      }

      milestoneBreakdowns.push({
        milestoneId: mp.milestoneId,
        milestoneTitle: milestone?.title || 'Unknown',
        totalDays: milestoneDays,
        resourceCost: milestoneResourceCost,
        teamMembers: Array.from(milestoneTeamMembers),
      });
    }

    // 4. Calculate totals
    const subtotal = totalResourceCost + totalExpenses;
    const discount = subtotal * ((pricing.discountPercentage || 0) / 100);
    const afterDiscount = subtotal - discount;
    const withholdingTax = afterDiscount * ((pricing.withholdingTaxPercentage || 0) / 100);
    const grandTotal = afterDiscount + withholdingTax;

    return {
      totalResourceCost,
      totalExpenses,
      subtotal,
      withholdingTax,
      discount,
      grandTotal,
      totalDays,
      teamMemberCount: teamMemberSet.size,
      byAssociate: associateBreakdowns,
      byMilestone: milestoneBreakdowns,
    };
  }

  private calculateExpenseCost(expense: ExpenseItem | undefined, pricing: ProjectPricing): number {
    if (!expense) return 0;
    
    const flightCost = (expense.numberOfFlights || 0) * (expense.avgFlightCost || 0);
    const accommodationCost = (expense.daysOnsite || 0) * 
      (expense.accommodationPerDay || pricing.defaultAccommodation || 0);
    const perDiemCost = (expense.daysOnsite || 0) * 
      (expense.perDiemPerDay || pricing.defaultPerDiem || 0);
    const otherCosts = (expense.groundTransport || 0) + 
      (expense.otherExpenses || 0) + 
      (expense.expenseBuffer || 0);

    return flightCost + accommodationCost + perDiemCost + otherCosts;
  }

  private emptyResult(): PricingCalculationResult {
    return {
      totalResourceCost: 0,
      totalExpenses: 0,
      subtotal: 0,
      withholdingTax: 0,
      discount: 0,
      grandTotal: 0,
      totalDays: 0,
      teamMemberCount: 0,
      byAssociate: [],
      byMilestone: [],
    };
  }
}
```

### 5.3 Lead Assignment Logic

```typescript
// lib/services/task-assignee.service.ts

export class TaskAssigneeService {
  
  async addAssignee(
    taskPricingId: string,
    associateId: string,
    daysOrDaysPerPeriod: number,
    isManualDays: boolean
  ): Promise<TaskAssignee> {
    // Check if any assignees exist
    const { rows: existing } = await db.query(
      'SELECT COUNT(*) as count FROM task_assignees WHERE task_pricing_id = $1',
      [taskPricingId]
    );
    
    const isFirstAssignee = parseInt(existing[0].count) === 0;
    
    // Get task pricing settings
    const { rows: [taskPricing] } = await db.query(
      'SELECT time_unit, number_of_periods FROM task_pricing WHERE id = $1',
      [taskPricingId]
    );
    
    let days: number;
    let daysPerPeriod: number;
    
    if (taskPricing.time_unit === 'full' || isManualDays) {
      days = daysOrDaysPerPeriod;
      daysPerPeriod = 0;
    } else {
      daysPerPeriod = daysOrDaysPerPeriod;
      days = daysPerPeriod * (taskPricing.number_of_periods || 0);
    }
    
    // Insert with is_lead = true for first assignee
    const { rows: [assignee] } = await db.query(`
      INSERT INTO task_assignees (task_pricing_id, associate_id, days, days_per_period, is_lead)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [taskPricingId, associateId, days, daysPerPeriod, isFirstAssignee]);
    
    return assignee;
  }
  
  async removeAssignee(taskAssigneeId: string): Promise<void> {
    // Get the assignee to check if they're lead
    const { rows: [assignee] } = await db.query(
      'SELECT * FROM task_assignees WHERE id = $1',
      [taskAssigneeId]
    );
    
    if (!assignee) return;
    
    // Delete the assignee
    await db.query('DELETE FROM task_assignees WHERE id = $1', [taskAssigneeId]);
    
    // If they were lead, promote the next assignee
    if (assignee.is_lead) {
      await db.query(`
        UPDATE task_assignees
        SET is_lead = true
        WHERE task_pricing_id = $1
        AND id = (
          SELECT id FROM task_assignees 
          WHERE task_pricing_id = $1 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      `, [assignee.task_pricing_id]);
    }
  }
  
  async promoteToLead(taskAssigneeId: string): Promise<void> {
    // Get the assignee's task_pricing_id
    const { rows: [assignee] } = await db.query(
      'SELECT task_pricing_id FROM task_assignees WHERE id = $1',
      [taskAssigneeId]
    );
    
    if (!assignee) return;
    
    // Begin transaction
    await db.query('BEGIN');
    
    try {
      // Remove lead from current lead
      await db.query(`
        UPDATE task_assignees SET is_lead = false 
        WHERE task_pricing_id = $1 AND is_lead = true
      `, [assignee.task_pricing_id]);
      
      // Set new lead
      await db.query(`
        UPDATE task_assignees SET is_lead = true WHERE id = $1
      `, [taskAssigneeId]);
      
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐                                                        │
│  │   Client    │                                                        │
│  │  (Browser)  │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                                │
│         │  1. Login Request (email, password)                           │
│         ▼                                                                │
│  ┌─────────────────────────────────────────┐                            │
│  │         POST /api/auth/login            │                            │
│  └──────────────────┬──────────────────────┘                            │
│                     │                                                    │
│         ┌───────────┴───────────┐                                       │
│         │                       │                                        │
│         ▼                       ▼                                        │
│  ┌─────────────┐         ┌─────────────┐                                │
│  │   Verify    │         │   Verify    │                                │
│  │  Password   │   OR    │   OAuth     │                                │
│  │  (bcrypt)   │         │   Token     │                                │
│  └──────┬──────┘         └──────┬──────┘                                │
│         │                       │                                        │
│         └───────────┬───────────┘                                       │
│                     │                                                    │
│                     ▼                                                    │
│  ┌─────────────────────────────────────────┐                            │
│  │      Generate JWT Access Token           │                            │
│  │      + Refresh Token                     │                            │
│  └──────────────────┬──────────────────────┘                            │
│                     │                                                    │
│                     │  2. Set HTTP-only cookies                         │
│                     ▼                                                    │
│  ┌─────────────────────────────────────────┐                            │
│  │     Store Session in Database           │                            │
│  │     (for token revocation)              │                            │
│  └──────────────────┬──────────────────────┘                            │
│                     │                                                    │
│                     │  3. Return user data + tokens                     │
│                     ▼                                                    │
│  ┌─────────────┐                                                        │
│  │   Client    │  ← Access token in HTTP-only cookie                    │
│  │  (Browser)  │  ← Refresh token in HTTP-only cookie                   │
│  └─────────────┘                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 JWT Token Structure

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string;          // User ID
  email: string;
  name: string;
  role: UserRole;
  associateId?: string;
  permissions: string[];
  iat: number;          // Issued at
  exp: number;          // Expires (15 minutes)
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string;          // User ID
  sessionId: string;    // Session ID for revocation
  iat: number;
  exp: number;          // Expires (7 days)
}
```

### 6.3 Authorization Middleware

```typescript
// lib/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLE_PERMISSIONS } from '@/lib/auth-store';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    associateId?: string;
    permissions: RolePermissions;
  };
}

export async function authMiddleware(
  request: NextRequest,
  requiredPermission?: keyof RolePermissions
): Promise<AuthenticatedRequest | NextResponse> {
  try {
    // 1. Get token from cookie or header
    const token = 
      request.cookies.get('access_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
        { status: 401 }
      );
    }

    // 2. Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload as unknown as AccessTokenPayload;

    // 3. Get role permissions
    const permissions = ROLE_PERMISSIONS[user.role];
    if (!permissions) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Invalid role' } },
        { status: 403 }
      );
    }

    // 4. Check specific permission if required
    if (requiredPermission && !permissions[requiredPermission]) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } },
        { status: 403 }
      );
    }

    // 5. Attach user to request
    (request as AuthenticatedRequest).user = {
      id: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
      associateId: user.associateId,
      permissions,
    };

    return request as AuthenticatedRequest;

  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json(
        { success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
      { status: 401 }
    );
  }
}

// Permission check helpers
export function hasPermission(user: AuthenticatedRequest['user'], permission: keyof RolePermissions): boolean {
  return user.permissions[permission] === true;
}

export function canAccessProject(user: AuthenticatedRequest['user'], project: Project): boolean {
  // ELT and Association Managers can access all
  if (user.role === 'elt' || user.role === 'association-manager') {
    return true;
  }
  
  // Engagement leads can access projects they own
  if (user.role === 'engagement-lead' && project.ownerId === user.associateId) {
    return true;
  }
  
  // Associates can access projects they're assigned to
  if (user.role === 'associate' && user.associateId) {
    return project.assignedAssociates?.some(a => a.id === user.associateId) || false;
  }
  
  return false;
}

export function canEditProject(user: AuthenticatedRequest['user'], project: Project): boolean {
  if (!hasPermission(user, 'editProject')) {
    return false;
  }
  
  // Engagement leads can only edit projects they own
  if (user.role === 'engagement-lead') {
    return project.ownerId === user.associateId;
  }
  
  return true;
}
```

### 6.4 Role-Based Permissions Matrix

```typescript
// lib/permissions.ts

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // ELT - Full access to everything
  elt: {
    dashboard: true,
    projects: true,
    projectBoard: true,
    clients: true,
    associates: true,
    documents: true,
    milestones: true,
    performance: true,
    settings: true,
    revenue: true,
    advisory: true,
    calculator: true,
    userManagement: true,
    newBusiness: true,
    brokerOnboarding: true,
    createProject: true,
    editProject: true,
    deleteProject: true,
    createClient: true,
    editClient: true,
    createAssociate: true,
    editAssociate: true,
    manageTeam: true,
    viewAllProjects: true,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: false,
    manageUsers: true,
    managePermissions: true,
    approvePricing: true,
    exportData: true,
  },

  // Association Manager - Most access except user management
  'association-manager': {
    dashboard: true,
    projects: true,
    projectBoard: false,
    clients: true,
    associates: true,
    documents: true,
    milestones: true,
    performance: true,
    settings: false,
    revenue: true,
    advisory: true,
    calculator: true,
    userManagement: false,
    newBusiness: true,
    brokerOnboarding: true,
    createProject: true,
    editProject: true,
    deleteProject: false,
    createClient: true,
    editClient: true,
    createAssociate: true,
    editAssociate: true,
    manageTeam: true,
    viewAllProjects: true,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: false,
    manageUsers: false,
    managePermissions: false,
    approvePricing: true,
    exportData: true,
  },

  // Engagement Lead - Own projects only
  'engagement-lead': {
    dashboard: true,
    projects: true,
    projectBoard: false,
    clients: false,
    associates: false,
    documents: true,
    milestones: true,
    performance: false,
    settings: false,
    revenue: false,
    advisory: false,
    calculator: false,
    userManagement: false,
    newBusiness: false,
    brokerOnboarding: false,
    createProject: false,
    editProject: true,
    deleteProject: false,
    createClient: false,
    editClient: false,
    createAssociate: false,
    editAssociate: false,
    manageTeam: true,
    viewAllProjects: false,
    viewOwnProjectsOnly: true,
    viewAssignedTasksOnly: false,
    manageUsers: false,
    managePermissions: false,
    approvePricing: false,
    exportData: false,
  },

  // Associate - Assigned tasks only
  associate: {
    dashboard: false,
    projects: true,
    projectBoard: false,
    clients: false,
    associates: false,
    documents: false,
    milestones: false,
    performance: false,
    settings: false,
    revenue: false,
    advisory: false,
    calculator: false,
    userManagement: false,
    newBusiness: false,
    brokerOnboarding: false,
    createProject: false,
    editProject: false,
    deleteProject: false,
    createClient: false,
    editClient: false,
    createAssociate: false,
    editAssociate: false,
    manageTeam: false,
    viewAllProjects: false,
    viewOwnProjectsOnly: false,
    viewAssignedTasksOnly: true,
    manageUsers: false,
    managePermissions: false,
    approvePricing: false,
    exportData: false,
  },
};
```

---

## 7. Middleware & Validation

### 7.1 Request Validation Middleware

```typescript
// lib/middleware/validate.ts
import { z, ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON body',
        },
      }, { status: 400 });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (request: NextRequest): { data: T } | NextResponse => {
    try {
      const params = Object.fromEntries(request.nextUrl.searchParams);
      const data = schema.parse(params);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        }, { status: 400 });
      }
      throw error;
    }
  };
}
```

### 7.2 Validation Schemas

```typescript
// lib/validations/project.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  clientId: z.string().uuid('Invalid client ID').optional().nullable(),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
  dueDate: z.string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  startDate: z.string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  budget: z.number()
    .positive('Budget must be positive')
    .max(999999999, 'Budget too large')
    .optional()
    .nullable(),
  budgetCurrency: z.enum(['USD', 'SAR', 'AED', 'EUR', 'GBP']).default('USD'),
  lifecycle: z.enum([
    'new-business', 
    'onboarding', 
    'execution', 
    'closure', 
    'learnings'
  ]).default('onboarding'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string().max(50)).max(10).default([]),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.startDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: 'Start date must be before or equal to due date',
  path: ['startDate'],
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['Onboarding', 'Execution', 'Blocked', 'Closed', 'On Hold']).optional(),
  health: z.enum(['on-track', 'at-risk', 'critical-risk']).optional(),
});

// lib/validations/milestone.ts
export const createMilestoneSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  deliverables: z.array(z.string().max(200)).max(20).default([]),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.startDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: 'Start date must be before due date',
  path: ['startDate'],
});

// lib/validations/task.ts
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255)
    .trim(),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().positive().max(999).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  parentTaskId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']).optional(),
  actualHours: z.number().positive().max(999).optional().nullable(),
});

// lib/validations/pricing.ts
export const updatePricingSettingsSchema = z.object({
  currency: z.enum(['USD', 'SAR', 'AED', 'EUR', 'GBP']).optional(),
  markupPercentage: z.number().min(0).max(200).optional(),
  withholdingTaxPercentage: z.number().min(0).max(50).optional(),
  defaultAccommodation: z.number().min(0).max(10000).optional(),
  defaultPerDiem: z.number().min(0).max(1000).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountReason: z.string().max(500).optional(),
  status: z.enum(['not-priced', 'in-progress', 'pending-approval', 'priced', 'locked']).optional(),
});

export const addTaskAssigneeSchema = z.object({
  projectId: z.string().uuid(),
  milestoneId: z.string(),
  taskId: z.string(),
  associateId: z.string().uuid(),
  days: z.number().min(0).max(365).optional(),
  daysPerPeriod: z.number().min(0).max(31).optional(),
});

export const updateTaskSettingsSchema = z.object({
  projectId: z.string().uuid(),
  milestoneId: z.string(),
  taskId: z.string(),
  timeUnit: z.enum(['full', 'week', 'month']),
  numberOfPeriods: z.number().min(0).max(52).optional(),
});
```

### 7.3 Rate Limiting Middleware

```typescript
// lib/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different endpoints
const limiters = {
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 login attempts per minute
    analytics: true,
  }),
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 write operations per minute
    analytics: true,
  }),
};

export async function rateLimitMiddleware(
  request: NextRequest,
  type: 'default' | 'auth' | 'write' = 'default'
): Promise<NextResponse | null> {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const limiter = limiters[type];
  
  const { success, limit, reset, remaining } = await limiter.limit(ip);
  
  if (!success) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }
  
  return null; // Continue processing
}
```

---

## 8. Error Handling

### 8.1 Error Types

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super('FORBIDDEN', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}
```

### 8.2 Global Error Handler

```typescript
// lib/middleware/error-handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  console.error('[API Error]', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    }, { status: 400 });
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }, { status: error.statusCode });
  }

  // Database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string };
    
    // Unique constraint violation
    if (dbError.code === '23505') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A record with this value already exists',
        },
      }, { status: 409 });
    }
    
    // Foreign key violation
    if (dbError.code === '23503') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'REFERENCE_ERROR',
          message: 'Referenced record does not exist',
        },
      }, { status: 400 });
    }
  }

  // Generic error
  const isDev = process.env.NODE_ENV === 'development';
  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev && error instanceof Error ? error.message : 'An unexpected error occurred',
      stack: isDev && error instanceof Error ? error.stack : undefined,
    },
  }, { status: 500 });
}
```

### 8.3 Error Response Format

```typescript
// Standard error response format
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: unknown;      // Additional error details (validation errors, etc.)
    retryAfter?: number;    // Seconds until retry (for rate limiting)
  };
}

// Example error responses
const examples = {
  validation: {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: [
        { path: 'name', message: 'Name is required' },
        { path: 'budget', message: 'Budget must be a positive number' },
      ],
    },
  },
  unauthorized: {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    },
  },
  forbidden: {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    },
  },
  notFound: {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Project not found',
    },
  },
  rateLimit: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
      retryAfter: 60,
    },
  },
};
```

---

## 9. Caching Strategy

### 9.1 Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CACHING ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐                                                        │
│  │   Client    │                                                        │
│  │   Cache     │  ← SWR / React Query (5 min stale time)               │
│  └──────┬──────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                        │
│  │    CDN      │  ← Static assets, images (1 year)                     │
│  │   (Vercel)  │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API LAYER                                    │   │
│  │                                                                   │   │
│  │  ┌───────────────┐     ┌───────────────┐                         │   │
│  │  │   Response    │     │   Session     │                         │   │
│  │  │   Cache       │     │   Cache       │                         │   │
│  │  │   (Redis)     │     │   (Redis)     │                         │   │
│  │  │   TTL: 5min   │     │   TTL: 24hr   │                         │   │
│  │  └───────────────┘     └───────────────┘                         │   │
│  │                                                                   │   │
│  │  Cache Keys:                                                      │   │
│  │  - projects:{userId}:{page}:{filters}                            │   │
│  │  - project:{projectId}                                           │   │
│  │  - pricing:{projectId}                                           │   │
│  │  - associates:list                                               │   │
│  │  - associate:{associateId}:workload                              │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                        │
│  │  Database   │  ← Connection pooling, query cache                    │
│  │ (PostgreSQL)│                                                        │
│  └─────────────┘                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Cache Implementation

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
};

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheService {
  
  // Get from cache with type safety
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      return null;
    }
  }
  
  // Set with TTL
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || CACHE_TTL.MEDIUM;
      await redis.setex(key, ttl, JSON.stringify(value));
      
      // Store tags for invalidation
      if (options.tags?.length) {
        for (const tag of options.tags) {
          await redis.sadd(`tag:${tag}`, key);
        }
      }
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }
  
  // Delete specific key
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('[Cache] Delete error:', error);
    }
  }
  
  // Invalidate by tag (delete all keys with tag)
  async invalidateTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await redis.del(...keys, `tag:${tag}`);
      }
    } catch (error) {
      console.error('[Cache] Invalidate tag error:', error);
    }
  }
  
  // Get or set pattern
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await fetchFn();
    await this.set(key, data, options);
    return data;
  }
}

export const cache = new CacheService();

// Cache key builders
export const cacheKeys = {
  projectsList: (userId: string, page: number, filters: string) => 
    `projects:${userId}:${page}:${filters}`,
  project: (projectId: string) => 
    `project:${projectId}`,
  projectPricing: (projectId: string) => 
    `pricing:${projectId}`,
  associates: () => 
    'associates:list',
  associateWorkload: (associateId: string) => 
    `associate:${associateId}:workload`,
  milestones: (projectId: string) => 
    `milestones:${projectId}`,
};

// Cache invalidation helpers
export async function invalidateProjectCache(projectId: string): Promise<void> {
  await Promise.all([
    cache.invalidateTag(`project:${projectId}`),
    cache.delete(cacheKeys.project(projectId)),
    cache.delete(cacheKeys.projectPricing(projectId)),
    cache.delete(cacheKeys.milestones(projectId)),
  ]);
}

export async function invalidateAssociateCache(associateId: string): Promise<void> {
  await Promise.all([
    cache.delete(cacheKeys.associates()),
    cache.delete(cacheKeys.associateWorkload(associateId)),
  ]);
}
```

### 9.3 Cache Usage Example

```typescript
// app/api/projects/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... auth checks ...
  
  // Try cache first
  const project = await cache.getOrSet(
    cacheKeys.project(params.id),
    async () => {
      const { rows } = await db.query(`
        SELECT p.*, 
          row_to_json(c.*) as client,
          row_to_json(o.*) as owner
        FROM projects p
        LEFT JOIN clients c ON c.id = p.client_id
        LEFT JOIN associates o ON o.id = p.owner_id
        WHERE p.id = $1
      `, [params.id]);
      return rows[0];
    },
    { 
      ttl: CACHE_TTL.MEDIUM,
      tags: [`project:${params.id}`]
    }
  );
  
  if (!project) {
    return notFound();
  }
  
  return NextResponse.json({ success: true, data: project });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... update logic ...
  
  // Invalidate cache after update
  await invalidateProjectCache(params.id);
  
  return NextResponse.json({ success: true, data: updated });
}
```

---

## 10. Scalability & Performance

### 10.1 Database Optimization

```sql
-- Partial indexes for common queries
CREATE INDEX idx_projects_active ON projects(status, lifecycle) 
WHERE status NOT IN ('Closed');

CREATE INDEX idx_tasks_pending ON tasks(milestone_id, status) 
WHERE status IN ('todo', 'in-progress');

-- Covering indexes for frequent queries
CREATE INDEX idx_task_assignees_covering ON task_assignees(task_pricing_id) 
INCLUDE (associate_id, days, is_lead);

-- Materialized view for expensive calculations
CREATE MATERIALIZED VIEW mv_project_summary AS
SELECT 
  p.id,
  p.name,
  p.status,
  c.name as client_name,
  COUNT(DISTINCT m.id) as milestone_count,
  COUNT(DISTINCT t.id) as task_count,
  COALESCE(SUM(ta.days), 0) as total_days,
  COUNT(DISTINCT ta.associate_id) as team_size
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
LEFT JOIN milestones m ON m.project_id = p.id
LEFT JOIN tasks t ON t.milestone_id = m.id
LEFT JOIN project_pricing pp ON pp.project_id = p.id
LEFT JOIN milestone_pricing mp ON mp.project_pricing_id = pp.id
LEFT JOIN task_pricing tp ON tp.milestone_pricing_id = mp.id
LEFT JOIN task_assignees ta ON ta.task_pricing_id = tp.id
GROUP BY p.id, p.name, p.status, c.name;

-- Refresh materialized view (schedule via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_summary;

-- Query optimization: Use EXPLAIN ANALYZE
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM projects WHERE client_id = $1;
```

### 10.2 Connection Pooling

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection
  maxUses: 7500,              // Close connection after 7500 uses
});

// Health check
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};

// For transactions
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 10.3 API Response Optimization

```typescript
// lib/middleware/compression.ts

// Enable response compression for large payloads
export function shouldCompress(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  
  // Only compress JSON responses larger than 1KB
  return (
    contentType?.includes('application/json') &&
    contentLength !== null &&
    parseInt(contentLength) > 1024
  );
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function paginate<T>(
  items: T[],
  totalCount: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalCount / params.limit);
  
  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}

// Field selection (sparse fieldsets)
export function selectFields<T extends object>(
  item: T,
  fields?: string[]
): Partial<T> {
  if (!fields || fields.length === 0) {
    return item;
  }
  
  const result: Partial<T> = {};
  for (const field of fields) {
    if (field in item) {
      result[field as keyof T] = item[field as keyof T];
    }
  }
  return result;
}
```

---

## 11. Real-time Updates

### 11.1 WebSocket Architecture

```typescript
// lib/realtime.ts
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '@/lib/auth';

export function initializeWebSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.id}`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Join project rooms based on permissions
    socket.on('subscribe:project', async (projectId: string) => {
      // Verify access
      const hasAccess = await checkProjectAccess(user, projectId);
      if (hasAccess) {
        socket.join(`project:${projectId}`);
      }
    });

    socket.on('unsubscribe:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
}

// Emit events from API routes
export function emitProjectUpdate(io: SocketIOServer, projectId: string, event: string, data: any) {
  io.to(`project:${projectId}`).emit(event, data);
}

export function emitUserNotification(io: SocketIOServer, userId: string, notification: any) {
  io.to(`user:${userId}`).emit('notification', notification);
}
```

### 11.2 Client-side Integration

```typescript
// hooks/use-realtime.ts
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';

let socket: Socket | null = null;

export function useRealtime(projectId?: string) {
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Initialize connection
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token },
        transports: ['websocket'],
      });
    }

    // Subscribe to project updates
    if (projectId) {
      socket.emit('subscribe:project', projectId);
    }

    return () => {
      if (projectId) {
        socket?.emit('unsubscribe:project', projectId);
      }
    };
  }, [token, projectId]);

  const onPricingUpdate = useCallback((callback: (data: any) => void) => {
    socket?.on('pricing:updated', callback);
    return () => {
      socket?.off('pricing:updated', callback);
    };
  }, []);

  const onTaskUpdate = useCallback((callback: (data: any) => void) => {
    socket?.on('task:updated', callback);
    return () => {
      socket?.off('task:updated', callback);
    };
  }, []);

  return {
    onPricingUpdate,
    onTaskUpdate,
  };
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// __tests__/services/pricing-calculation.test.ts
import { PricingCalculationService } from '@/lib/services/pricing-calculation.service';

describe('PricingCalculationService', () => {
  const service = new PricingCalculationService();

  describe('calculateProjectPricing', () => {
    it('should calculate total days correctly', async () => {
      const mockPricing = {
        projectId: 'p1',
        milestonePricing: [{
          milestoneId: 'm1',
          tasks: [{
            taskId: 't1',
            assignees: [
              { associateId: 'a1', days: 5 },
              { associateId: 'a2', days: 3 },
            ],
          }],
        }],
        associateRates: [
          { associateId: 'a1', markedUpRate: 1000 },
          { associateId: 'a2', markedUpRate: 800 },
        ],
        expenses: [],
        withholdingTaxPercentage: 5,
        discountPercentage: 0,
      };

      jest.spyOn(service as any, 'getProjectPricingData').mockResolvedValue(mockPricing);
      jest.spyOn(service as any, 'getAssociate').mockResolvedValue({ name: 'Test' });
      jest.spyOn(service as any, 'getMilestone').mockResolvedValue({ title: 'Test' });

      const result = await service.calculateProjectPricing('p1');

      expect(result.totalDays).toBe(8);
      expect(result.totalResourceCost).toBe(7400); // 5*1000 + 3*800
      expect(result.teamMemberCount).toBe(2);
    });

    it('should apply discount correctly', async () => {
      // ... test with discount
    });

    it('should calculate expenses correctly', async () => {
      // ... test with expenses
    });
  });
});
```

### 12.2 Integration Tests

```typescript
// __tests__/api/projects.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/projects/route';

describe('/api/projects', () => {
  describe('GET', () => {
    it('should return projects for authenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      // Mock auth
      jest.spyOn(authModule, 'getServerSession').mockResolvedValue({
        user: { id: 'u1', role: 'elt' },
      });

      // Mock database
      jest.spyOn(dbModule, 'query').mockResolvedValue({
        rows: [{ id: 'p1', name: 'Test Project' }],
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toHaveLength(1);
    });

    it('should return 401 for unauthenticated request', async () => {
      const { req } = createMocks({ method: 'GET' });
      
      jest.spyOn(authModule, 'getServerSession').mockResolvedValue(null);
      
      const response = await GET(req as any);
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create project with valid data', async () => {
      // ... test creation
    });

    it('should reject invalid data', async () => {
      // ... test validation
    });
  });
});
```

### 12.3 E2E Tests

```typescript
// e2e/pricing-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pricing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should add team member to task', async ({ page }) => {
    // Navigate to calculator
    await page.click('text=Calculator');
    await page.click('text=Acme Corp Project');
    
    // Go to resourcing tab
    await page.click('text=Resourcing');
    
    // Expand first phase
    await page.click('[data-testid="phase-header-0"]');
    
    // Click add member button on first task
    await page.click('[data-testid="add-member-btn-0-0"]');
    
    // Select team member
    await page.click('text=John Smith');
    
    // Enter days
    await page.fill('[data-testid="assignee-days-input"]', '5');
    
    // Verify the assignee appears
    await expect(page.locator('text=John Smith')).toBeVisible();
    await expect(page.locator('[data-testid="task-total-days"]')).toContainText('5d');
  });

  test('should update time unit and recalculate days', async ({ page }) => {
    // ... test time unit change
  });
});
```

---

## 13. Migration Guide

### 13.1 Migration from Zustand to Database

```typescript
// scripts/migrate-to-database.ts

import { db } from '@/lib/db';
import { usePricingStore } from '@/lib/pricing-store';

async function migratePricingData() {
  console.log('Starting migration...');
  
  // Get all data from Zustand store (localStorage)
  const store = usePricingStore.getState();
  const { projectPricings } = store;
  
  for (const pricing of projectPricings) {
    try {
      await db.query('BEGIN');
      
      // 1. Insert project_pricing
      const { rows: [projectPricing] } = await db.query(`
        INSERT INTO project_pricing (
          project_id, status, currency, markup_percentage,
          withholding_tax_percentage, default_accommodation, default_per_diem
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (project_id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING id
      `, [
        pricing.projectId,
        pricing.status,
        pricing.currency,
        pricing.markupPercentage,
        pricing.withholdingTaxPercentage,
        pricing.defaultAccommodation,
        pricing.defaultPerDiem,
      ]);
      
      // 2. Migrate milestone pricing
      for (const mp of pricing.milestonePricing || []) {
        const { rows: [milestonePricing] } = await db.query(`
          INSERT INTO milestone_pricing (project_pricing_id, milestone_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          RETURNING id
        `, [projectPricing.id, mp.milestoneId]);
        
        if (!milestonePricing) continue;
        
        // 3. Migrate task pricing
        for (const tp of mp.tasks || []) {
          const { rows: [taskPricing] } = await db.query(`
            INSERT INTO task_pricing (milestone_pricing_id, task_id, time_unit, number_of_periods)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            RETURNING id
          `, [milestonePricing.id, tp.taskId, tp.timeUnit, tp.numberOfPeriods || 0]);
          
          if (!taskPricing) continue;
          
          // 4. Migrate assignees
          for (const assignee of tp.assignees || []) {
            await db.query(`
              INSERT INTO task_assignees (
                task_pricing_id, associate_id, days, days_per_period, is_lead
              )
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT DO NOTHING
            `, [
              taskPricing.id,
              assignee.associateId,
              assignee.days,
              assignee.daysPerPeriod || 0,
              assignee.isLead || false,
            ]);
          }
        }
      }
      
      // 5. Migrate rates
      for (const rate of pricing.associateRates || []) {
        await db.query(`
          INSERT INTO associate_rates (
            project_pricing_id, associate_id, base_rate, marked_up_rate
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [projectPricing.id, rate.associateId, rate.baseRate, rate.markedUpRate]);
      }
      
      // 6. Migrate expenses
      for (const expense of pricing.expenses || []) {
        await db.query(`
          INSERT INTO expense_items (
            project_pricing_id, associate_id, number_of_flights, avg_flight_cost,
            days_onsite, accommodation_per_day, per_diem_per_day, expense_buffer
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [
          projectPricing.id,
          expense.associateId,
          expense.numberOfFlights,
          expense.avgFlightCost,
          expense.daysOnsite,
          expense.accommodationPerDay,
          expense.perDiemPerDay,
          expense.expenseBuffer,
        ]);
      }
      
      await db.query('COMMIT');
      console.log(`Migrated pricing for project: ${pricing.projectId}`);
      
    } catch (error) {
      await db.query('ROLLBACK');
      console.error(`Error migrating project ${pricing.projectId}:`, error);
    }
  }
  
  console.log('Migration complete!');
}

// Run migration
migratePricingData().catch(console.error);
```

### 13.2 Gradual Migration Strategy

```
Phase 1: Database Setup (Week 1-2)
├── Create database schema
├── Set up connection pooling
├── Implement basic CRUD endpoints
└── Add database triggers

Phase 2: API Development (Week 2-4)
├── Implement all API endpoints
├── Add validation & error handling
├── Set up authentication
└── Add caching layer

Phase 3: Migration (Week 4-5)
├── Run data migration script
├── Verify data integrity
├── Test all endpoints
└── Performance testing

Phase 4: Switch Over (Week 5-6)
├── Update frontend to use new APIs
├── Keep Zustand as fallback
├── Monitor for issues
└── Remove Zustand dependency

Phase 5: Cleanup (Week 6+)
├── Remove migration code
├── Optimize queries
├── Add real-time features
└── Documentation
```

---

## Appendix A: API Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `GET` | `/api/projects/:id/milestones` | List milestones |
| `POST` | `/api/projects/:id/milestones` | Create milestone |
| `PUT` | `/api/milestones/:id` | Update milestone |
| `DELETE` | `/api/milestones/:id` | Delete milestone |
| `GET` | `/api/milestones/:id/tasks` | List tasks |
| `POST` | `/api/milestones/:id/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/projects/:id/pricing` | Get pricing |
| `PUT` | `/api/projects/:id/pricing` | Update pricing settings |
| `POST` | `/api/pricing/task-assignees` | Add assignee |
| `PUT` | `/api/task-assignees/:id` | Update assignee |
| `DELETE` | `/api/task-assignees/:id` | Remove assignee |
| `PUT` | `/api/pricing/task-settings` | Update time unit |
| `GET` | `/api/associates` | List associates |
| `GET` | `/api/associates/:id/workload` | Get workload |

---

## Appendix B: Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_MAX=20

# Redis Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Authentication
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app

# Feature Flags
ENABLE_REALTIME=true
ENABLE_CACHING=true
```

---

*Document Version: 2.0*
*Last Updated: January 22, 2026*
*Author: System Design Team*
