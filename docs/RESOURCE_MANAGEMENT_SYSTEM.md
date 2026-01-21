# Resource Management System - Technical Design Document

## Overview

The Resource Management System is a comprehensive feature for managing project phases, milestones, tasks, and team member assignments with pricing calculations. The **Resourcing Grid** serves as the primary interface for creating and managing project structure, while the **Project Page** provides editing capabilities.

---

## 1. System Architecture

### 1.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESOURCE MANAGEMENT SYSTEM                         │
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
│  │         │              │  (Team Members + Days)          │       │        │
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

### 1.2 Component Hierarchy

```
ResourceManagementSystem/
├── ResourcingGrid/                    # Primary Interface
│   ├── StatsBar                       # Quick stats (team count, days, phases)
│   ├── PhaseList                      # Collapsible phase cards
│   │   ├── PhaseHeader               # Phase title, dates, progress
│   │   ├── PhaseActions              # Add task, edit, delete
│   │   └── TaskList                  # Tasks within phase
│   │       ├── TaskRow               # Individual task row
│   │       │   ├── TaskInfo          # Title, ID, due date
│   │       │   ├── TimeUnitSelector  # Full/Weekly/Monthly
│   │       │   ├── TeamAssignment    # Team member chips
│   │       │   │   ├── AssigneeChip  # Avatar + days input
│   │       │   │   └── AddMemberBtn  # Add team member popover
│   │       │   └── DaysSummary       # Total days badge
│   │       └── AddTaskRow            # Add new task
│   └── AddPhaseDialog                # Create new phase modal
│
├── ProjectPage/                       # Editing Interface
│   ├── PhaseEditor                   # Edit phase details
│   ├── MilestoneEditor               # Edit milestone details
│   └── TaskEditor                    # Edit task details
│
├── TeamSummary/                       # Team allocation view
│   ├── AssociateSummaryCard          # Per-person allocation
│   └── AllocationChart               # Visual breakdown
│
└── PricingCalculator/                 # Cost calculation
    ├── RateCard                       # Associate rates
    ├── ExpenseCard                    # Travel expenses
    └── TotalSummary                   # Final pricing
```

---

## 2. Data Models & Database Schema

### 2.1 Core Entities

#### Project (Phase Container)
```typescript
interface Project {
  id: string                    // Primary key (UUID)
  name: string                  // Project/Phase name
  client: string                // Client reference
  status: ProjectStatus         // Onboarding | Execution | Blocked | Closed
  lifecycle: ProjectLifecycle   // new-business | onboarding | execution | closure
  health: ProjectHealth         // on-track | at-risk | critical-risk
  owner: string                 // Project owner name
  ownerId: string               // FK to Associate
  dueDate: string               // Target completion date
  createdAt: string             // Creation timestamp
  milestones: Milestone[]       // Embedded milestones
  assignedAssociates: string[]  // FK array to Associates
}
```

#### Milestone (Phase/Sprint)
```typescript
interface Milestone {
  id: string                    // Primary key (UUID)
  title: string                 // Milestone/Phase name
  projectId: string             // FK to Project
  startDate: string             // Start date (ISO)
  dueDate: string               // End date (ISO)
  status: MilestoneStatus       // not-started | in-progress | completed | blocked
  completion: number            // 0-100 percentage
  blockers: string[]            // Blocker descriptions
  tasks: Task[]                 // Embedded tasks
}
```

#### Task
```typescript
interface Task {
  id: string                    // Primary key (UUID)
  title: string                 // Task name
  projectId: string             // FK to Project
  milestoneId: string           // FK to Milestone
  assigneeId: string            // FK to Associate (primary assignee)
  status: TaskStatus            // todo | in-progress | done
  priority: Priority            // low | medium | high
  dueDate: string               // Due date (ISO)
  timeStarted?: string          // When work started
  timeCompleted?: string        // When completed
  cycleTime?: number            // Days to complete
}
```

#### Associate (Team Member)
```typescript
interface Associate {
  id: string                    // Primary key (UUID)
  name: string                  // Full name
  email: string                 // Email address
  avatar: string                // Avatar URL
  role: string                  // Job title
  department?: string           // Department
  availability: Availability    // available | partially-available | unavailable
  maxCapacity: number           // Max concurrent projects
  skills: Skill[]               // Skills with proficiency
  activeProjects: number        // Current project count
}
```

### 2.2 Pricing Entities

#### ProjectPricing
```typescript
interface ProjectPricing {
  id: string                    // Primary key (UUID)
  projectId: string             // FK to Project
  status: PricingStatus         // not-priced | in-progress | priced
  currency: Currency            // USD | SAR | AED
  markupPercentage: number      // e.g., 50 for 50%
  withholdingTaxPercentage: number
  defaultAccommodation: number  // Per day rate
  defaultPerDiem: number        // Per day rate
  createdAt: string
  updatedAt: string
  
  // Relationships
  milestonePricing: MilestonePricing[]
  associateRates: AssociateRate[]
  expenses: ExpenseItem[]
}
```

#### MilestonePricing
```typescript
interface MilestonePricing {
  id: string                    // Primary key (UUID)
  projectPricingId: string      // FK to ProjectPricing
  milestoneId: string           // FK to Milestone
  tasks: TaskPricing[]          // Embedded task pricing
}
```

#### TaskPricing
```typescript
interface TaskPricing {
  id: string                    // Primary key (UUID)
  milestonePricingId: string    // FK to MilestonePricing
  taskId: string                // FK to Task
  timeUnit: TimeUnit            // full | week | month
  numberOfPeriods?: number      // e.g., 8 weeks, 3 months
  assignees: TaskAssignee[]     // Embedded assignees
}
```

#### TaskAssignee
```typescript
interface TaskAssignee {
  id: string                    // Primary key (UUID)
  taskPricingId: string         // FK to TaskPricing
  associateId: string           // FK to Associate
  days: number                  // Total calculated days
  daysPerPeriod?: number        // Days per week/month (for time unit calc)
}
```

#### AssociateRate
```typescript
interface AssociateRate {
  id: string                    // Primary key (UUID)
  projectPricingId: string      // FK to ProjectPricing
  associateId: string           // FK to Associate
  baseRate: number              // Daily rate before markup
  markedUpRate: number          // Daily rate after markup
}
```

#### ExpenseItem
```typescript
interface ExpenseItem {
  id: string                    // Primary key (UUID)
  projectPricingId: string      // FK to ProjectPricing
  associateId: string           // FK to Associate
  numberOfFlights?: number
  avgFlightCost?: number
  daysOnsite?: number
  accommodationPerDay?: number
  perDiemPerDay?: number
  expenseBuffer?: number
}
```

### 2.3 Database Schema (SQL)

```sql
-- =====================================================
-- CORE TABLES
-- =====================================================

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Associates (Team Members)
CREATE TABLE associates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  role VARCHAR(100),
  department VARCHAR(100),
  availability VARCHAR(30) DEFAULT 'available',
  max_capacity INTEGER DEFAULT 5,
  active_projects INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id),
  status VARCHAR(20) DEFAULT 'Onboarding',
  lifecycle VARCHAR(30) DEFAULT 'onboarding',
  health VARCHAR(20) DEFAULT 'on-track',
  owner_id UUID REFERENCES associates(id),
  due_date DATE,
  milestones_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Assigned Associates (Many-to-Many)
CREATE TABLE project_associates (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, associate_id)
);

-- Milestones (Phases)
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_date DATE,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'not-started',
  completion INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  assignee_id UUID REFERENCES associates(id),
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE,
  time_started TIMESTAMP,
  time_completed TIMESTAMP,
  cycle_time INTEGER,
  sort_order INTEGER DEFAULT 0,
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestone Pricing (Links milestone to pricing)
CREATE TABLE milestone_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_pricing_id UUID REFERENCES project_pricing(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_pricing_id, milestone_id)
);

-- Task Pricing (Time unit and period settings per task)
CREATE TABLE task_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_pricing_id UUID REFERENCES milestone_pricing(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  time_unit VARCHAR(10) DEFAULT 'full', -- 'full', 'week', 'month'
  number_of_periods INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(milestone_pricing_id, task_id)
);

-- Task Assignees (Team members assigned with days)
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_pricing_id UUID REFERENCES task_pricing(id) ON DELETE CASCADE,
  associate_id UUID REFERENCES associates(id) ON DELETE CASCADE,
  days DECIMAL(10,2) DEFAULT 0,
  days_per_period DECIMAL(10,2) DEFAULT 0,
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
  expense_buffer DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_pricing_id, associate_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_task_pricing_milestone ON task_pricing(milestone_pricing_id);
CREATE INDEX idx_task_assignees_task ON task_assignees(task_pricing_id);
CREATE INDEX idx_project_pricing_project ON project_pricing(project_id);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Project Resource Summary
CREATE VIEW project_resource_summary AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  COUNT(DISTINCT m.id) AS milestone_count,
  COUNT(DISTINCT t.id) AS task_count,
  COUNT(DISTINCT ta.associate_id) AS team_member_count,
  COALESCE(SUM(ta.days), 0) AS total_days,
  pp.status AS pricing_status,
  pp.currency
FROM projects p
LEFT JOIN milestones m ON m.project_id = p.id
LEFT JOIN tasks t ON t.milestone_id = m.id
LEFT JOIN project_pricing pp ON pp.project_id = p.id
LEFT JOIN milestone_pricing mp ON mp.project_pricing_id = pp.id AND mp.milestone_id = m.id
LEFT JOIN task_pricing tp ON tp.milestone_pricing_id = mp.id AND tp.task_id = t.id
LEFT JOIN task_assignees ta ON ta.task_pricing_id = tp.id
GROUP BY p.id, p.name, pp.status, pp.currency;

-- View: Associate Workload
CREATE VIEW associate_workload AS
SELECT 
  a.id AS associate_id,
  a.name AS associate_name,
  a.role,
  COUNT(DISTINCT p.id) AS project_count,
  COALESCE(SUM(ta.days), 0) AS total_days_assigned,
  a.availability,
  a.max_capacity
FROM associates a
LEFT JOIN task_assignees ta ON ta.associate_id = a.id
LEFT JOIN task_pricing tp ON tp.id = ta.task_pricing_id
LEFT JOIN milestone_pricing mp ON mp.id = tp.milestone_pricing_id
LEFT JOIN project_pricing pp ON pp.id = mp.project_pricing_id
LEFT JOIN projects p ON p.id = pp.project_id
GROUP BY a.id, a.name, a.role, a.availability, a.max_capacity;
```

---

## 3. Component Specifications

### 3.1 Resourcing Grid (Primary Interface)

#### Purpose
The primary interface for creating, viewing, and managing project resource allocation. Users can add phases, milestones, tasks, and assign team members with time allocations.

#### Features

| Feature | Description | User Action |
|---------|-------------|-------------|
| **Stats Bar** | Shows team count, total days, phase count | View only |
| **Add Phase** | Create new milestone/phase | Click "Add Phase" button |
| **Collapsible Phases** | Expand/collapse phase cards | Click phase header |
| **Time Unit Selector** | Set task time unit (Full/Weekly/Monthly) | Select from dropdown per task |
| **Period Input** | Set number of weeks/months | Enter number when Weekly/Monthly selected |
| **Team Assignment** | Add/remove team members to tasks | Click "Add" or "X" on chip |
| **Inline Day Input** | Enter days per team member | Type in chip input field |
| **Total Days Badge** | Shows calculated total per task | Auto-calculated |

#### State Management

```typescript
interface ResourcingGridState {
  expandedPhases: Set<string>       // Which phases are expanded
  editingTask: string | null        // Currently editing task ID
  addingMemberTo: string | null     // Task ID for member add popover
  timeUnitChanging: string | null   // Task ID being updated
  isLoading: boolean                // Loading state
  error: string | null              // Error message
}
```

#### Key Interactions

```
User Flow: Adding Team Member to Task
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Click "Add"  │────▶│ Select       │────▶│ Enter days   │
│ on task      │     │ team member  │     │ in chip      │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Store updates│
                     │ assignees    │
                     └──────────────┘

User Flow: Changing Time Unit
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Select       │────▶│ Enter # of   │────▶│ Days auto-   │
│ Weekly/Month │     │ periods      │     │ calculated   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ All assignee │
                                         │ days update  │
                                         └──────────────┘
```

### 3.2 Time Unit Calculation Logic

```typescript
// Time unit affects how days are calculated
type TimeUnit = 'full' | 'week' | 'month'

// Calculation rules:
// - 'full': User enters total days directly
// - 'week': days = daysPerPeriod × numberOfPeriods (weeks)
// - 'month': days = daysPerPeriod × numberOfPeriods (months)

function calculateTotalDays(
  timeUnit: TimeUnit,
  daysPerPeriod: number,
  numberOfPeriods: number,
  manualDays: number
): number {
  if (timeUnit === 'full') {
    return manualDays
  }
  return daysPerPeriod * numberOfPeriods
}

// Example:
// Weekly: 2 days/week × 8 weeks = 16 total days
// Monthly: 10 days/month × 3 months = 30 total days
```

### 3.3 Add Phase Dialog

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | text | Yes | Phase/Milestone name |
| Start Date | date | Yes | Phase start date |
| End Date | date | Yes | Phase end date |
| Description | textarea | No | Optional description |

#### Actions
- **Save**: Creates milestone, initializes pricing entry
- **Cancel**: Closes dialog without saving

### 3.4 Team Assignment Component

#### Chip Design
```
┌─────────────────────────────────────────┐
│ [Avatar] [Name] [Input: 0] [d/wk] [X]   │
└─────────────────────────────────────────┘

- Avatar: 24x24 circular image
- Name: First name only (truncated)
- Input: 3-char width number input
- Unit: "d" for full, "/wk" for weekly, "/mo" for monthly
- X: Remove button (appears on hover)
```

---

## 4. User Flows

### 4.1 Creating a New Project with Resources

```
1. Navigate to Calculator → Select Project
2. If no phases exist:
   - Empty state shown with "Add First Phase" CTA
3. Click "Add Phase"
   - Dialog opens with form
   - Enter: Title, Start Date, End Date
   - Click Save
4. Phase appears in grid (expanded by default)
5. Add tasks to phase:
   - Click "Add Task" in phase
   - Enter task title, due date
6. Assign team members:
   - Click "Add" on task row
   - Select team member from popover
   - Enter days in chip input
7. Set time unit (optional):
   - Change from "Full" to "Weekly" or "Monthly"
   - Enter number of periods
   - Days auto-calculate for all assignees
```

### 4.2 Editing Existing Resources

```
1. Navigate to Calculator → Select Project
2. Expand phase to view tasks
3. To edit phase:
   - Click edit icon on phase header
   - Modify title, dates in dialog
4. To edit task:
   - Modify values inline (title, due date)
5. To change team allocation:
   - Click on chip to open popover
   - Modify days or remove
6. To change time unit:
   - Select new unit from dropdown
   - Enter periods if applicable
   - All days recalculate automatically
```

### 4.3 Viewing Resource Summary

```
1. Navigate to Calculator → Team Summary tab
2. View allocation by team member:
   - Total days across all tasks
   - Cost breakdown
   - Project distribution
3. Filter by:
   - Phase
   - Time period
   - Team member role
```

---

## 5. Technical Considerations

### 5.1 Performance Optimization

```typescript
// Use React.memo for list items
const TaskRow = React.memo(({ task, milestone, pricing }) => {
  // Component implementation
})

// Use useMemo for calculations
const totalDays = useMemo(() => {
  return taskAssignees.reduce((sum, a) => sum + (a.days || 0), 0)
}, [taskAssignees])

// Debounce input changes
const debouncedUpdate = useDebouncedCallback(
  (value) => updateTaskAssignee(...),
  300
)
```

### 5.2 State Persistence

```typescript
// Zustand store with persistence
const usePricingStore = create(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'pricing-store',
      partialize: (state) => ({
        projectPricings: state.projectPricings
      })
    }
  )
)
```

### 5.3 Optimistic Updates

```typescript
// Update UI immediately, rollback on error
async function updateAssignee(data) {
  const previousState = store.getState()
  
  // Optimistic update
  store.updateTaskAssignee(data)
  
  try {
    await api.updateTaskAssignee(data)
  } catch (error) {
    // Rollback on error
    store.setState(previousState)
    toast.error('Failed to update')
  }
}
```

### 5.4 Error Handling

```typescript
// Input validation
function validateDays(value: string): number | null {
  const num = parseFloat(value)
  if (isNaN(num) || num < 0) return null
  if (num > 365) return null // Reasonable max
  return num
}

// API error handling
try {
  await saveChanges()
} catch (error) {
  if (error.code === 'CONFLICT') {
    // Handle concurrent edit
    showConflictDialog()
  } else {
    toast.error('Failed to save changes')
  }
}
```

---

## 6. Data Relationships Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA RELATIONSHIPS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLIENT ──────┬──────▶ PROJECT ◀────── ASSOCIATE (Owner)        │
│               │            │                                     │
│               │            │ 1:N                                 │
│               │            ▼                                     │
│               │       MILESTONE ◀────── PROJECT_PRICING         │
│               │            │                 │                   │
│               │            │ 1:N             │ 1:1               │
│               │            ▼                 ▼                   │
│               │         TASK ◀─────── MILESTONE_PRICING         │
│               │            │                 │                   │
│               │            │                 │ 1:N               │
│               │            │                 ▼                   │
│               │            │          TASK_PRICING              │
│               │            │                 │                   │
│               │            │                 │ 1:N               │
│               │            │                 ▼                   │
│               │            └────────▶ TASK_ASSIGNEE             │
│               │                            │                     │
│               │                            │ N:1                 │
│               │                            ▼                     │
│               └──────────────────────▶ ASSOCIATE                │
│                                            │                     │
│                                            │ 1:N                 │
│                                            ▼                     │
│                                    ASSOCIATE_RATE               │
│                                    EXPENSE_ITEM                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

KEY:
──────▶  Foreign Key (belongs to)
◀──────  Has many
1:N      One to Many
N:1      Many to One
1:1      One to One
```

---

## 7. API Endpoints (Future Implementation)

```typescript
// Phases/Milestones
POST   /api/projects/:projectId/milestones
GET    /api/projects/:projectId/milestones
PUT    /api/milestones/:id
DELETE /api/milestones/:id

// Tasks
POST   /api/milestones/:milestoneId/tasks
GET    /api/milestones/:milestoneId/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

// Pricing
GET    /api/projects/:projectId/pricing
PUT    /api/projects/:projectId/pricing
POST   /api/pricing/:pricingId/task-assignees
PUT    /api/task-assignees/:id
DELETE /api/task-assignees/:id

// Associates
GET    /api/associates
GET    /api/associates/:id/availability
```

---

## 8. Migration Path

### From Current System to Database

1. **Phase 1**: Add database tables (keep Zustand for UI state)
2. **Phase 2**: Implement API endpoints
3. **Phase 3**: Migrate Zustand actions to API calls
4. **Phase 4**: Add real-time sync (optional)
5. **Phase 5**: Remove mock data, connect to live database

---

## 9. Testing Checklist

- [ ] Add phase with valid dates
- [ ] Add phase with invalid dates (end before start)
- [ ] Add task to phase
- [ ] Assign team member to task
- [ ] Change time unit from Full to Weekly
- [ ] Change time unit from Weekly to Monthly
- [ ] Change time unit from Monthly to Full
- [ ] Update periods and verify day recalculation
- [ ] Remove team member from task
- [ ] Delete task with assignees
- [ ] Delete phase with tasks
- [ ] Concurrent editing (multiple tabs)
- [ ] Large dataset performance (50+ phases)
