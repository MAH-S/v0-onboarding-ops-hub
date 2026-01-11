export type ProjectLifecycle = "new-business" | "onboarding" | "execution" | "closure" | "learnings" | "completed"
export type ProjectHealth = "on-track" | "at-risk" | "critical-risk"
export type FinanceReadiness = "quote" | "invoice" | "overdue" | "paid"

export type ClientStatus = "active" | "prospect" | "inactive" | "churned"
export type ClientTier = "enterprise" | "mid-market" | "startup"

export interface ClientContact {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  isPrimary: boolean
}

export interface Client {
  id: string
  name: string
  logo?: string
  industry: string
  domain?: string
  employeeCount?: number
  foundedYear?: number
  status: ClientStatus
  tier: ClientTier
  website?: string
  description: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zip: string
  }
  contacts: ClientContact[]
  contractStart?: string
  contractEnd?: string
  totalRevenue: number
  outstandingBalance: number
  healthScore: number // 0-100
  notes: string
  tags: string[]
  createdAt: string
}

export const ONBOARDING_STEPS = [
  { step: 1, label: "Win Communication" },
  { step: 2, label: "Internal Processes (PC, QB, Monday etc.)" },
  { step: 3, label: "Engagement Lead Briefing (Incl Technical Proposal)" },
  { step: 4, label: "Resourcing Review & Refinement" },
  { step: 5, label: "Project Team Briefing (Incl Technical Proposal)" },
  { step: 6, label: "Partner Briefing" },
  { step: 7, label: "ASOW Generation" },
  { step: 8, label: "Client Logistics (Hotel, Office Space)" },
  { step: 9, label: "Expense Budget Allocation to EL" },
  { step: 10, label: "Client Briefing" },
  { step: 11, label: "Project Plan & Risk Register" },
  { step: 12, label: "Project/Client Mobilization" },
] as const

export interface Project {
  id: string
  name: string
  client: string
  status: "Onboarding" | "Execution" | "Blocked" | "Closed"
  lifecycle: ProjectLifecycle
  health: ProjectHealth
  onboardingStep?: number
  owner: string
  ownerId: string
  nextAction: string
  dueDate: string
  lastUpdate: { date: string; user: string }
  financeReadiness: FinanceReadiness
  alerts: { type: "risk" | "blocker" | "overdue" | "pending"; message: string }[]
  financeAutomationBlocked: boolean
  auditLog: { action: string; user: string; date: string }[]
  assignedAssociates: string[]
  milestonesProgress: number
  openTasks: number
  avgCycleTime: number
  mondayBoardLink?: string
  createdAt: string
  notes: Note[]
  uploads: Upload[]
  milestones: Milestone[]
  costingRequests: CostingRequest[]
}

export interface Associate {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  activeProjects: number
  openTasks: number
  milestonesOverdue: number
  avgCycleTime: number
  performanceScore: number
  tasksCompletedHistory: { date: string; count: number }[]
  cycleTimeHistory: { date: string; time: number }[]
  approvalTurnaroundHistory: { date: string; time: number }[]
  topDelayReasons: string[]
  phone?: string
  department?: string
  location?: string
  startDate?: string
  manager?: string
  managerId?: string
  bio?: string
  strengths: string[]
  skills: { name: string; level: "beginner" | "intermediate" | "advanced" | "expert"; yearsExp: number }[]
  certifications: { name: string; issuer: string; date: string; expiryDate?: string }[]
  languages: { language: string; proficiency: "basic" | "conversational" | "fluent" | "native" }[]
  availability: "available" | "partially-available" | "unavailable"
  maxCapacity: number // max projects they can handle
  schedule: {
    dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
    startTime: string
    endTime: string
    type: "office" | "remote" | "client-site"
  }[]
  timeOff: {
    startDate: string
    endDate: string
    type: "vacation" | "sick" | "personal" | "training"
    approved: boolean
  }[]
  notes?: string
}

export interface Task {
  id: string
  title: string
  projectId: string
  milestoneId: string
  assigneeId: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate: string
  timeStarted?: string
  timeCompleted?: string
  cycleTime?: number
}

export interface Milestone {
  id: string
  title: string
  projectId: string
  startDate: string
  dueDate: string
  status: "not-started" | "in-progress" | "completed" | "blocked"
  completion: number
  blockers: string[]
  tasks: Task[]
}

export interface Upload {
  id: string
  fileName: string
  type: "Quote" | "Invoice"
  vendor: string
  amount: number
  currency: string
  date: string
  uploadedBy: string
  uploadedById: string
  status: "Pending Review" | "Approved" | "Rejected"
  reviewNote?: string
  projectId: string
  milestoneId?: string
}

export interface Note {
  id: string
  content: string
  type: "Costing" | "Client" | "Finance" | "Risk"
  authorId: string
  authorName: string
  createdAt: string
  projectId: string
}

export interface CostingRequest {
  id: string
  title: string
  projectId: string
  requestedAmount: number
  items: string
  agingDays: number
  status: "Draft" | "Submitted" | "Approved" | "Returned"
  managerNotes?: string
  requestedById: string
  createdAt: string
}

export const associates: Associate[] = [
  {
    id: "a1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    avatar: "/professional-woman-avatar.png",
    role: "Senior Associate",
    activeProjects: 4,
    openTasks: 12,
    milestonesOverdue: 1,
    avgCycleTime: 2.3,
    performanceScore: 92,
    tasksCompletedHistory: [
      { date: "2025-12-01", count: 8 },
      { date: "2025-12-08", count: 12 },
      { date: "2025-12-15", count: 10 },
      { date: "2025-12-22", count: 15 },
      { date: "2025-12-29", count: 11 },
      { date: "2026-01-05", count: 14 },
    ],
    cycleTimeHistory: [
      { date: "2025-12-01", time: 2.5 },
      { date: "2025-12-08", time: 2.3 },
      { date: "2025-12-15", time: 2.1 },
      { date: "2025-12-22", time: 2.4 },
      { date: "2025-12-29", time: 2.2 },
      { date: "2026-01-05", time: 2.3 },
    ],
    approvalTurnaroundHistory: [
      { date: "2025-12-01", time: 1.2 },
      { date: "2025-12-08", time: 1.0 },
      { date: "2025-12-15", time: 1.5 },
      { date: "2025-12-22", time: 1.1 },
      { date: "2025-12-29", time: 0.9 },
      { date: "2026-01-05", time: 1.0 },
    ],
    topDelayReasons: ["Client feedback delay", "Vendor response pending"],
    phone: "+1 (555) 123-4567",
    department: "Implementation",
    location: "San Francisco, CA",
    startDate: "2022-03-15",
    manager: "David Kim",
    managerId: "a4",
    bio: "Experienced project lead with a passion for client success. Specializes in complex enterprise implementations and stakeholder management.",
    strengths: [
      "Client Relationship Management",
      "Strategic Planning",
      "Cross-functional Leadership",
      "Problem Solving Under Pressure",
      "Technical Documentation",
    ],
    skills: [
      { name: "Project Management", level: "expert", yearsExp: 6 },
      { name: "Stakeholder Communication", level: "expert", yearsExp: 5 },
      { name: "Data Analysis", level: "advanced", yearsExp: 4 },
      { name: "Process Optimization", level: "advanced", yearsExp: 3 },
      { name: "Agile/Scrum", level: "advanced", yearsExp: 4 },
      { name: "SQL", level: "intermediate", yearsExp: 2 },
      { name: "Tableau", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [
      { name: "PMP", issuer: "PMI", date: "2023-06-15", expiryDate: "2026-06-15" },
      { name: "Certified Scrum Master", issuer: "Scrum Alliance", date: "2022-09-01", expiryDate: "2024-09-01" },
      { name: "Six Sigma Green Belt", issuer: "ASQ", date: "2023-01-20" },
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Mandarin", proficiency: "fluent" },
      { language: "Spanish", proficiency: "conversational" },
    ],
    availability: "available",
    maxCapacity: 5,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "17:00", type: "remote" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [{ startDate: "2026-01-20", endDate: "2026-01-24", type: "vacation", approved: true }],
    notes: "Prefers morning meetings. Available for client travel.",
  },
  {
    id: "a2",
    name: "Marcus Johnson",
    email: "marcus.j@company.com",
    avatar: "/professional-man-avatar.png",
    role: "Associate",
    activeProjects: 3,
    openTasks: 8,
    milestonesOverdue: 0,
    avgCycleTime: 1.8,
    performanceScore: 88,
    tasksCompletedHistory: [
      { date: "2025-12-01", count: 6 },
      { date: "2025-12-08", count: 9 },
      { date: "2025-12-15", count: 7 },
      { date: "2025-12-22", count: 11 },
      { date: "2025-12-29", count: 8 },
      { date: "2026-01-05", count: 10 },
    ],
    cycleTimeHistory: [
      { date: "2025-12-01", time: 2.0 },
      { date: "2025-12-08", time: 1.9 },
      { date: "2025-12-15", time: 1.7 },
      { date: "2025-12-22", time: 1.8 },
      { date: "2025-12-29", time: 1.6 },
      { date: "2026-01-05", time: 1.8 },
    ],
    approvalTurnaroundHistory: [
      { date: "2025-12-01", time: 1.5 },
      { date: "2025-12-08", time: 1.3 },
      { date: "2025-12-15", time: 1.4 },
      { date: "2025-12-22", time: 1.2 },
      { date: "2025-12-29", time: 1.1 },
      { date: "2026-01-05", time: 1.2 },
    ],
    topDelayReasons: ["Internal approval bottleneck"],
    phone: "+1 (555) 234-5678",
    department: "Technical Solutions",
    location: "New York, NY",
    startDate: "2023-07-10",
    manager: "Sarah Chen",
    managerId: "a1",
    bio: "Technical specialist focused on system integrations and data migrations. Strong analytical skills with a background in software engineering.",
    strengths: ["Technical Analysis", "System Integration", "Data Migration", "Troubleshooting", "API Development"],
    skills: [
      { name: "System Integration", level: "advanced", yearsExp: 4 },
      { name: "Python", level: "advanced", yearsExp: 5 },
      { name: "SQL", level: "expert", yearsExp: 6 },
      { name: "REST APIs", level: "advanced", yearsExp: 4 },
      { name: "Data Analysis", level: "advanced", yearsExp: 4 },
      { name: "JavaScript", level: "intermediate", yearsExp: 3 },
      { name: "AWS", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [
      { name: "AWS Solutions Architect", issuer: "Amazon", date: "2024-03-10", expiryDate: "2027-03-10" },
      { name: "Google Data Analytics", issuer: "Google", date: "2023-11-15" },
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "French", proficiency: "basic" },
    ],
    availability: "available",
    maxCapacity: 4,
    schedule: [
      { dayOfWeek: "monday", startTime: "08:30", endTime: "17:30", type: "office" },
      { dayOfWeek: "tuesday", startTime: "08:30", endTime: "17:30", type: "office" },
      { dayOfWeek: "wednesday", startTime: "08:30", endTime: "17:30", type: "office" },
      { dayOfWeek: "thursday", startTime: "08:30", endTime: "17:30", type: "remote" },
      { dayOfWeek: "friday", startTime: "08:30", endTime: "16:30", type: "remote" },
    ],
    timeOff: [],
    notes: "Strong technical background. Go-to person for integration issues.",
  },
  {
    id: "a3",
    name: "Emily Rodriguez",
    email: "emily.r@company.com",
    avatar: "/latina-professional-avatar.png",
    role: "Associate",
    activeProjects: 2,
    openTasks: 5,
    milestonesOverdue: 2,
    avgCycleTime: 3.1,
    performanceScore: 75,
    tasksCompletedHistory: [
      { date: "2025-12-01", count: 4 },
      { date: "2025-12-08", count: 5 },
      { date: "2025-12-15", count: 4 },
      { date: "2025-12-22", count: 6 },
      { date: "2025-12-29", count: 5 },
      { date: "2026-01-05", count: 7 },
    ],
    cycleTimeHistory: [
      { date: "2025-12-01", time: 3.5 },
      { date: "2025-12-08", time: 3.2 },
      { date: "2025-12-15", time: 3.0 },
      { date: "2025-12-22", time: 3.3 },
      { date: "2025-12-29", time: 3.1 },
      { date: "2026-01-05", time: 3.1 },
    ],
    approvalTurnaroundHistory: [
      { date: "2025-12-01", time: 2.0 },
      { date: "2025-12-08", time: 2.2 },
      { date: "2025-12-15", time: 1.8 },
      { date: "2025-12-22", time: 2.1 },
      { date: "2025-12-29", time: 1.9 },
      { date: "2026-01-05", time: 2.0 },
    ],
    topDelayReasons: ["Resource constraints", "Complex requirements", "Vendor delays"],
    phone: "+1 (555) 345-6789",
    department: "Client Services",
    location: "Chicago, IL",
    startDate: "2024-01-08",
    manager: "Sarah Chen",
    managerId: "a1",
    bio: "Client-focused professional with strong communication skills. Currently developing expertise in project management and process improvement.",
    strengths: [
      "Client Communication",
      "Documentation",
      "Attention to Detail",
      "Bilingual Support",
      "Training Delivery",
    ],
    skills: [
      { name: "Client Relations", level: "advanced", yearsExp: 3 },
      { name: "Documentation", level: "advanced", yearsExp: 3 },
      { name: "Process Mapping", level: "intermediate", yearsExp: 2 },
      { name: "Excel", level: "advanced", yearsExp: 4 },
      { name: "Project Coordination", level: "intermediate", yearsExp: 1 },
      { name: "Presentation", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [{ name: "CAPM", issuer: "PMI", date: "2024-06-20", expiryDate: "2029-06-20" }],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Spanish", proficiency: "native" },
      { language: "Portuguese", proficiency: "conversational" },
    ],
    availability: "partially-available",
    maxCapacity: 3,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "18:00", type: "client-site" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "18:00", type: "client-site" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [{ startDate: "2026-02-10", endDate: "2026-02-14", type: "training", approved: true }],
    notes: "Currently in development program. Needs additional support on complex projects.",
  },
  {
    id: "a4",
    name: "David Kim",
    email: "david.kim@company.com",
    avatar: "/professional-asian-man-avatar.png",
    role: "Senior Associate",
    activeProjects: 5,
    openTasks: 15,
    milestonesOverdue: 0,
    avgCycleTime: 1.5,
    performanceScore: 95,
    tasksCompletedHistory: [
      { date: "2025-12-01", count: 10 },
      { date: "2025-12-08", count: 14 },
      { date: "2025-12-15", count: 12 },
      { date: "2025-12-22", count: 16 },
      { date: "2025-12-29", count: 13 },
      { date: "2026-01-05", count: 15 },
    ],
    cycleTimeHistory: [
      { date: "2025-12-01", time: 1.6 },
      { date: "2025-12-08", time: 1.5 },
      { date: "2025-12-15", time: 1.4 },
      { date: "2025-12-22", time: 1.5 },
      { date: "2025-12-29", time: 1.4 },
      { date: "2026-01-05", time: 1.5 },
    ],
    approvalTurnaroundHistory: [
      { date: "2025-12-01", time: 0.8 },
      { date: "2025-12-08", time: 0.7 },
      { date: "2025-12-15", time: 0.9 },
      { date: "2025-12-22", time: 0.8 },
      { date: "2025-12-29", time: 0.7 },
      { date: "2026-01-05", time: 0.8 },
    ],
    topDelayReasons: [],
    phone: "+1 (555) 456-7890",
    department: "Implementation",
    location: "San Francisco, CA",
    startDate: "2020-06-01",
    bio: "Team lead and mentor with extensive experience in enterprise implementations. Known for delivering complex projects on time and under budget.",
    strengths: [
      "Team Leadership",
      "Strategic Execution",
      "Risk Management",
      "Mentoring",
      "Executive Communication",
      "Change Management",
    ],
    skills: [
      { name: "Project Management", level: "expert", yearsExp: 8 },
      { name: "Team Leadership", level: "expert", yearsExp: 6 },
      { name: "Risk Management", level: "expert", yearsExp: 7 },
      { name: "Change Management", level: "advanced", yearsExp: 5 },
      { name: "Agile/Scrum", level: "expert", yearsExp: 6 },
      { name: "Stakeholder Management", level: "expert", yearsExp: 7 },
      { name: "Financial Analysis", level: "advanced", yearsExp: 4 },
      { name: "SAP", level: "intermediate", yearsExp: 3 },
    ],
    certifications: [
      { name: "PMP", issuer: "PMI", date: "2021-04-10", expiryDate: "2027-04-10" },
      { name: "PgMP", issuer: "PMI", date: "2023-08-15", expiryDate: "2026-08-15" },
      { name: "Certified Scrum Master", issuer: "Scrum Alliance", date: "2020-09-01", expiryDate: "2026-09-01" },
      { name: "ITIL Foundation", issuer: "Axelos", date: "2022-02-20" },
      { name: "Six Sigma Black Belt", issuer: "ASQ", date: "2024-01-15" },
    ],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Korean", proficiency: "fluent" },
      { language: "Japanese", proficiency: "conversational" },
    ],
    availability: "available",
    maxCapacity: 6,
    schedule: [
      { dayOfWeek: "monday", startTime: "08:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "08:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "08:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "08:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "friday", startTime: "08:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [{ startDate: "2026-03-01", endDate: "2026-03-07", type: "vacation", approved: true }],
    notes: "Team lead for implementation. Available for escalations and mentoring.",
  },
]

export const clients: Client[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    industry: "Manufacturing",
    domain: "Industrial Equipment & Automation",
    employeeCount: 5200,
    foundedYear: 1985,
    status: "active",
    tier: "enterprise",
    website: "https://acme-corp.com",
    description:
      "Global manufacturing leader specializing in industrial equipment and automation solutions. Long-standing partner since 2020 with multiple successful implementations.",
    address: {
      street: "123 Industrial Blvd",
      city: "Chicago",
      state: "IL",
      country: "USA",
      zip: "60601",
    },
    contacts: [
      {
        id: "cc1",
        name: "John Mitchell",
        role: "VP of Operations",
        email: "j.mitchell@acme-corp.com",
        phone: "+1 (312) 555-0101",
        isPrimary: true,
      },
      {
        id: "cc2",
        name: "Lisa Park",
        role: "Project Manager",
        email: "l.park@acme-corp.com",
        phone: "+1 (312) 555-0102",
        isPrimary: false,
      },
      { id: "cc3", name: "Robert Chen", role: "IT Director", email: "r.chen@acme-corp.com", isPrimary: false },
    ],
    contractStart: "2024-01-15",
    contractEnd: "2026-01-14",
    totalRevenue: 850000,
    outstandingBalance: 45000,
    healthScore: 85,
    notes: "Strategic account. Expanding into new regions. Potential for additional service lines.",
    tags: ["strategic", "manufacturing", "automation"],
    createdAt: "2020-03-15",
  },
  {
    id: "c2",
    name: "TechStart Inc",
    industry: "Technology",
    domain: "HR Technology / SaaS",
    employeeCount: 85,
    foundedYear: 2021,
    status: "active",
    tier: "startup",
    website: "https://techstart.io",
    description:
      "Fast-growing SaaS startup focused on HR technology solutions. High potential for growth but requires close attention due to rapid scaling needs.",
    address: {
      street: "456 Innovation Way",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      zip: "94105",
    },
    contacts: [
      {
        id: "cc4",
        name: "Amanda Wright",
        role: "CEO",
        email: "amanda@techstart.io",
        phone: "+1 (415) 555-0201",
        isPrimary: true,
      },
      {
        id: "cc5",
        name: "Dev Patel",
        role: "CTO",
        email: "dev@techstart.io",
        phone: "+1 (415) 555-0202",
        isPrimary: false,
      },
    ],
    contractStart: "2025-06-01",
    contractEnd: "2026-05-31",
    totalRevenue: 125000,
    outstandingBalance: 15000,
    healthScore: 72,
    notes: "High growth potential. Currently in onboarding phase. CEO is highly engaged.",
    tags: ["high-growth", "saas", "hr-tech"],
    createdAt: "2025-05-20",
  },
  {
    id: "c3",
    name: "Global Finance Partners",
    industry: "Financial Services",
    domain: "Investment Banking & Asset Management",
    employeeCount: 12500,
    foundedYear: 1972,
    status: "active",
    tier: "enterprise",
    website: "https://gfpartners.com",
    description:
      "Premier financial services firm with global operations. Strict compliance requirements and high security standards.",
    address: {
      street: "789 Wall Street",
      city: "New York",
      state: "NY",
      country: "USA",
      zip: "10005",
    },
    contacts: [
      {
        id: "cc6",
        name: "Michael Torres",
        role: "Chief Operating Officer",
        email: "m.torres@gfpartners.com",
        phone: "+1 (212) 555-0301",
        isPrimary: true,
      },
      {
        id: "cc7",
        name: "Sarah Williams",
        role: "Compliance Director",
        email: "s.williams@gfpartners.com",
        phone: "+1 (212) 555-0302",
        isPrimary: false,
      },
      {
        id: "cc8",
        name: "James Anderson",
        role: "Project Sponsor",
        email: "j.anderson@gfpartners.com",
        isPrimary: false,
      },
      {
        id: "cc9",
        name: "Emily Foster",
        role: "Business Analyst",
        email: "e.foster@gfpartners.com",
        isPrimary: false,
      },
    ],
    contractStart: "2023-09-01",
    contractEnd: "2026-08-31",
    totalRevenue: 1250000,
    outstandingBalance: 180000,
    healthScore: 45,
    notes: "Currently facing challenges with data migration. Requires executive attention. Risk of escalation.",
    tags: ["enterprise", "financial-services", "compliance", "at-risk"],
    createdAt: "2023-08-15",
  },
  {
    id: "c4",
    name: "HealthCare Plus",
    industry: "Healthcare",
    domain: "Hospital Networks & Medical Services",
    employeeCount: 8400,
    foundedYear: 1998,
    status: "prospect",
    tier: "mid-market",
    website: "https://healthcareplus.org",
    description:
      "Regional healthcare provider network exploring digital transformation initiatives. Currently in sales discussions.",
    address: {
      street: "321 Medical Center Dr",
      city: "Boston",
      state: "MA",
      country: "USA",
      zip: "02115",
    },
    contacts: [
      {
        id: "cc10",
        name: "Dr. Patricia Moore",
        role: "Chief Digital Officer",
        email: "p.moore@healthcareplus.org",
        phone: "+1 (617) 555-0401",
        isPrimary: true,
      },
      {
        id: "cc11",
        name: "Kevin O'Brien",
        role: "IT Manager",
        email: "k.obrien@healthcareplus.org",
        phone: "+1 (617) 555-0402",
        isPrimary: false,
      },
    ],
    contractStart: "2025-01-01",
    contractEnd: "2027-12-31",
    totalRevenue: 450000,
    outstandingBalance: 0,
    healthScore: 92,
    notes: "Excellent relationship. Paid in full. Discussing expansion to additional facilities.",
    tags: ["healthcare", "digital-transformation", "expansion-opportunity"],
    createdAt: "2024-11-01",
  },
  {
    id: "c5",
    name: "RetailMax Group",
    industry: "Retail",
    status: "prospect",
    tier: "enterprise",
    website: "https://retailmax.com",
    description:
      "National retail chain with 500+ stores. Interested in supply chain optimization and inventory management solutions.",
    address: {
      street: "555 Commerce Ave",
      city: "Dallas",
      state: "TX",
      country: "USA",
      zip: "75201",
    },
    contacts: [
      {
        id: "cc12",
        name: "Jennifer Blake",
        role: "VP Supply Chain",
        email: "j.blake@retailmax.com",
        isPrimary: true,
      },
    ],
    totalRevenue: 0,
    outstandingBalance: 0,
    healthScore: 0,
    notes: "In discovery phase. RFP expected Q2 2026. Strong fit for our supply chain services.",
    tags: ["prospect", "retail", "supply-chain"],
    createdAt: "2025-12-01",
  },
  {
    id: "c6",
    name: "EduTech Solutions",
    industry: "Education",
    status: "inactive",
    tier: "mid-market",
    website: "https://edutech-solutions.com",
    description: "Educational technology provider for K-12 schools. Previous engagement completed successfully.",
    address: {
      street: "888 Learning Lane",
      city: "Austin",
      state: "TX",
      country: "USA",
      zip: "78701",
    },
    contacts: [
      {
        id: "cc13",
        name: "Thomas Green",
        role: "Director of Technology",
        email: "t.green@edutech-solutions.com",
        isPrimary: true,
      },
    ],
    contractStart: "2023-01-01",
    contractEnd: "2024-12-31",
    totalRevenue: 275000,
    outstandingBalance: 0,
    healthScore: 78,
    notes: "Contract ended Dec 2024. Good relationship. Potential for re-engagement in 2026.",
    tags: ["education", "completed", "re-engagement"],
    createdAt: "2022-11-15",
  },
]

export const projects: Project[] = [
  {
    id: "p1",
    name: "Acme Corp Onboarding",
    client: "Acme Corporation",
    status: "Execution",
    lifecycle: "execution",
    health: "on-track",
    owner: "Sarah Chen",
    ownerId: "a1",
    nextAction: "Complete vendor assessment",
    dueDate: "2026-01-15",
    lastUpdate: { date: "2026-01-10", user: "Sarah Chen" },
    financeReadiness: "invoice",
    alerts: [],
    financeAutomationBlocked: false,
    auditLog: [
      { action: "Project moved to Execution", user: "Sarah Chen", date: "2026-01-05" },
      { action: "Health updated to On Track", user: "Marcus Johnson", date: "2026-01-03" },
    ],
    assignedAssociates: ["a1", "a2"],
    milestonesProgress: 65,
    openTasks: 8,
    avgCycleTime: 2.1,
    mondayBoardLink: "https://monday.com/boards/123456",
    createdAt: "2025-11-15",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p2",
    name: "TechStart Integration",
    client: "TechStart Inc",
    status: "Onboarding",
    lifecycle: "onboarding",
    health: "at-risk",
    onboardingStep: 7,
    owner: "Emily Rodriguez",
    ownerId: "a3",
    nextAction: "Generate ASOW document",
    dueDate: "2026-01-12",
    lastUpdate: { date: "2026-01-09", user: "Emily Rodriguez" },
    financeReadiness: "quote",
    alerts: [
      { type: "risk", message: "Client briefing delayed by 2 days" },
      { type: "pending", message: "Awaiting partner confirmation" },
    ],
    financeAutomationBlocked: false,
    auditLog: [
      { action: "Onboarding step changed to 7: ASOW Generation", user: "Emily Rodriguez", date: "2026-01-09" },
      { action: "Health changed to At Risk", user: "David Kim", date: "2026-01-08" },
    ],
    assignedAssociates: ["a1", "a3"],
    milestonesProgress: 25,
    openTasks: 12,
    avgCycleTime: 2.8,
    mondayBoardLink: "https://monday.com/boards/234567",
    createdAt: "2025-12-01",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p3",
    name: "Global Finance Migration",
    client: "Global Finance Ltd",
    status: "Blocked",
    lifecycle: "onboarding",
    health: "critical-risk",
    onboardingStep: 4,
    owner: "David Kim",
    ownerId: "a4",
    nextAction: "Resolve resourcing constraints",
    dueDate: "2026-01-08",
    lastUpdate: { date: "2026-01-07", user: "David Kim" },
    financeReadiness: "overdue",
    alerts: [
      { type: "blocker", message: "Waiting for client data export" },
      { type: "blocker", message: "Security clearance pending" },
      { type: "overdue", message: "Invoice payment 15 days overdue" },
    ],
    financeAutomationBlocked: true,
    auditLog: [
      { action: "Finance automation blocked", user: "David Kim", date: "2026-01-07" },
      { action: "Health changed to Critical Risk", user: "Sarah Chen", date: "2026-01-05" },
    ],
    assignedAssociates: ["a2", "a4"],
    milestonesProgress: 40,
    openTasks: 15,
    avgCycleTime: 3.5,
    mondayBoardLink: "https://monday.com/boards/345678",
    createdAt: "2025-10-20",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p4",
    name: "Retail Plus Setup",
    client: "Retail Plus",
    status: "Execution",
    lifecycle: "execution",
    health: "on-track",
    owner: "Emily Rodriguez",
    ownerId: "a3",
    nextAction: "Complete final testing",
    dueDate: "2026-01-10",
    lastUpdate: { date: "2026-01-09", user: "Emily Rodriguez" },
    financeReadiness: "paid",
    alerts: [],
    financeAutomationBlocked: false,
    auditLog: [{ action: "Project moved to Execution", user: "Emily Rodriguez", date: "2025-12-20" }],
    assignedAssociates: ["a3"],
    milestonesProgress: 80,
    openTasks: 3,
    avgCycleTime: 1.9,
    mondayBoardLink: "https://monday.com/boards/456789",
    createdAt: "2025-09-10",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p5",
    name: "HealthCare Systems Upgrade",
    client: "HealthCare Systems",
    status: "Execution",
    lifecycle: "onboarding",
    health: "at-risk",
    onboardingStep: 11,
    owner: "Sarah Chen",
    ownerId: "a1",
    nextAction: "Finalize project plan",
    dueDate: "2026-01-14",
    lastUpdate: { date: "2026-01-08", user: "Sarah Chen" },
    financeReadiness: "invoice",
    alerts: [{ type: "risk", message: "Resource allocation pending approval" }],
    financeAutomationBlocked: false,
    auditLog: [
      { action: "Onboarding step changed to 11: Project Plan & Risk Register", user: "Sarah Chen", date: "2026-01-08" },
    ],
    assignedAssociates: ["a4", "a1"],
    milestonesProgress: 55,
    openTasks: 10,
    avgCycleTime: 2.4,
    mondayBoardLink: "https://monday.com/boards/567890",
    createdAt: "2025-11-01",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p6",
    name: "EduTech Platform Launch",
    client: "EduTech Solutions",
    status: "Closed",
    lifecycle: "closure",
    health: "on-track",
    owner: "Marcus Johnson",
    ownerId: "a2",
    nextAction: "Archive project documentation",
    dueDate: "2026-01-20",
    lastUpdate: { date: "2026-01-05", user: "Marcus Johnson" },
    financeReadiness: "paid",
    alerts: [],
    financeAutomationBlocked: false,
    auditLog: [{ action: "Project moved to Closure", user: "Marcus Johnson", date: "2026-01-05" }],
    assignedAssociates: ["a2"],
    milestonesProgress: 100,
    openTasks: 0,
    avgCycleTime: 1.7,
    mondayBoardLink: "https://monday.com/boards/678901",
    createdAt: "2025-08-01",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p7",
    name: "Quantum Analytics Platform",
    client: "Quantum Corp",
    status: "Onboarding",
    lifecycle: "new-business",
    health: "on-track",
    owner: "David Kim",
    ownerId: "a4",
    nextAction: "Complete win communication",
    dueDate: "2026-01-18",
    lastUpdate: { date: "2026-01-10", user: "David Kim" },
    financeReadiness: "quote",
    alerts: [],
    financeAutomationBlocked: false,
    auditLog: [{ action: "Project created", user: "David Kim", date: "2026-01-10" }],
    assignedAssociates: ["a4"],
    milestonesProgress: 0,
    openTasks: 2,
    avgCycleTime: 0,
    mondayBoardLink: "https://monday.com/boards/789012",
    createdAt: "2026-01-10",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p8",
    name: "SecureBank Implementation",
    client: "SecureBank Ltd",
    status: "Onboarding",
    lifecycle: "onboarding",
    health: "critical-risk",
    onboardingStep: 3,
    owner: "Marcus Johnson",
    ownerId: "a2",
    nextAction: "Complete engagement lead briefing",
    dueDate: "2026-01-09",
    lastUpdate: { date: "2026-01-06", user: "Marcus Johnson" },
    financeReadiness: "overdue",
    alerts: [
      { type: "overdue", message: "Due date passed" },
      { type: "blocker", message: "Technical proposal requires revision" },
    ],
    financeAutomationBlocked: false,
    auditLog: [{ action: "Health changed to Critical Risk", user: "Sarah Chen", date: "2026-01-09" }],
    assignedAssociates: ["a2", "a1"],
    milestonesProgress: 15,
    openTasks: 8,
    avgCycleTime: 3.2,
    mondayBoardLink: "https://monday.com/boards/890123",
    createdAt: "2025-12-15",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
  {
    id: "p9",
    name: "GreenEnergy Portal",
    client: "GreenEnergy Inc",
    status: "Closed",
    lifecycle: "learnings",
    health: "on-track",
    owner: "Sarah Chen",
    ownerId: "a1",
    nextAction: "Complete lessons learned documentation",
    dueDate: "2026-01-25",
    lastUpdate: { date: "2026-01-08", user: "Sarah Chen" },
    financeReadiness: "paid",
    alerts: [],
    financeAutomationBlocked: false,
    auditLog: [{ action: "Project moved to Learnings", user: "Sarah Chen", date: "2026-01-08" }],
    assignedAssociates: ["a1", "a3"],
    milestonesProgress: 100,
    openTasks: 1,
    avgCycleTime: 1.9,
    mondayBoardLink: "https://monday.com/boards/901234",
    createdAt: "2025-07-15",
    notes: [],
    uploads: [],
    milestones: [],
    costingRequests: [],
  },
]

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Complete vendor assessment",
    projectId: "p1",
    milestoneId: "m1",
    assigneeId: "a1",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-01-10",
    timeStarted: "2026-01-03",
  },
  {
    id: "t2",
    title: "Review contract terms",
    projectId: "p1",
    milestoneId: "m1",
    assigneeId: "a2",
    status: "todo",
    priority: "medium",
    dueDate: "2026-01-12",
  },
  {
    id: "t3",
    title: "Setup development environment",
    projectId: "p2",
    milestoneId: "m2",
    assigneeId: "a1",
    status: "done",
    priority: "high",
    dueDate: "2026-01-05",
    timeStarted: "2026-01-01",
    timeCompleted: "2026-01-04",
    cycleTime: 3,
  },
  {
    id: "t4",
    title: "Configure API integrations",
    projectId: "p2",
    milestoneId: "m2",
    assigneeId: "a3",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-01-15",
    timeStarted: "2026-01-05",
  },
  {
    id: "t5",
    title: "Data migration planning",
    projectId: "p3",
    milestoneId: "m3",
    assigneeId: "a2",
    status: "todo",
    priority: "high",
    dueDate: "2026-01-08",
  },
  {
    id: "t6",
    title: "Stakeholder alignment meeting",
    projectId: "p3",
    milestoneId: "m3",
    assigneeId: "a4",
    status: "todo",
    priority: "medium",
    dueDate: "2026-01-09",
  },
  {
    id: "t7",
    title: "Final testing and QA",
    projectId: "p4",
    milestoneId: "m4",
    assigneeId: "a3",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-01-07",
    timeStarted: "2026-01-04",
  },
  {
    id: "t8",
    title: "User training documentation",
    projectId: "p5",
    milestoneId: "m5",
    assigneeId: "a4",
    status: "todo",
    priority: "low",
    dueDate: "2026-01-20",
  },
  {
    id: "t9",
    title: "Security audit preparation",
    projectId: "p5",
    milestoneId: "m5",
    assigneeId: "a1",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-01-11",
    timeStarted: "2026-01-02",
  },
  {
    id: "t10",
    title: "Vendor contract negotiation",
    projectId: "p1",
    milestoneId: "m1",
    assigneeId: "a1",
    status: "todo",
    priority: "medium",
    dueDate: "2026-01-14",
  },
]

export const milestones: Milestone[] = [
  {
    id: "m1",
    title: "Phase 1: Initial Setup",
    projectId: "p1",
    startDate: "2025-11-15",
    dueDate: "2026-01-15",
    status: "in-progress",
    completion: 60,
    blockers: [],
    tasks: tasks.filter((t) => t.milestoneId === "m1"),
  },
  {
    id: "m2",
    title: "Development Environment Setup",
    projectId: "p2",
    startDate: "2025-12-01",
    dueDate: "2026-01-20",
    status: "in-progress",
    completion: 35,
    blockers: [],
    tasks: tasks.filter((t) => t.milestoneId === "m2"),
  },
  {
    id: "m3",
    title: "Data Migration Phase",
    projectId: "p3",
    startDate: "2025-10-20",
    dueDate: "2026-01-05",
    status: "blocked",
    completion: 40,
    blockers: ["Waiting for client data export", "Security clearance pending"],
    tasks: tasks.filter((t) => t.milestoneId === "m3"),
  },
  {
    id: "m4",
    title: "Final Deployment",
    projectId: "p4",
    startDate: "2025-12-15",
    dueDate: "2026-01-10",
    status: "in-progress",
    completion: 85,
    blockers: [],
    tasks: tasks.filter((t) => t.milestoneId === "m4"),
  },
  {
    id: "m5",
    title: "System Integration",
    projectId: "p5",
    startDate: "2025-11-01",
    dueDate: "2026-01-25",
    status: "in-progress",
    completion: 50,
    blockers: [],
    tasks: tasks.filter((t) => t.milestoneId === "m5"),
  },
  {
    id: "m6",
    title: "Phase 2: Advanced Features",
    projectId: "p1",
    startDate: "2026-01-16",
    dueDate: "2026-02-28",
    status: "not-started",
    completion: 0,
    blockers: [],
    tasks: [],
  },
]

export const uploads: Upload[] = [
  {
    id: "u1",
    fileName: "vendor_quote_acme.pdf",
    type: "Quote",
    vendor: "Tech Solutions Inc",
    amount: 25000,
    currency: "USD",
    date: "2026-01-02",
    uploadedBy: "Sarah Chen",
    uploadedById: "a1",
    status: "Pending Review",
    projectId: "p1",
    milestoneId: "m1",
  },
  {
    id: "u2",
    fileName: "invoice_dec_2025.pdf",
    type: "Invoice",
    vendor: "Cloud Services Co",
    amount: 15000,
    currency: "USD",
    date: "2025-12-28",
    uploadedBy: "Marcus Johnson",
    uploadedById: "a2",
    status: "Approved",
    projectId: "p2",
    milestoneId: "m2",
  },
  {
    id: "u3",
    fileName: "migration_quote.pdf",
    type: "Quote",
    vendor: "DataMove Ltd",
    amount: 45000,
    currency: "USD",
    date: "2026-01-04",
    uploadedBy: "David Kim",
    uploadedById: "a4",
    status: "Pending Review",
    projectId: "p3",
    milestoneId: "m3",
  },
  {
    id: "u4",
    fileName: "hosting_invoice.pdf",
    type: "Invoice",
    vendor: "AWS",
    amount: 8500,
    currency: "USD",
    date: "2025-12-30",
    uploadedBy: "Emily Rodriguez",
    uploadedById: "a3",
    status: "Rejected",
    reviewNote: "Missing itemized breakdown",
    projectId: "p4",
    milestoneId: "m4",
  },
  {
    id: "u5",
    fileName: "security_audit_quote.pdf",
    type: "Quote",
    vendor: "SecureIT Solutions",
    amount: 12000,
    currency: "USD",
    date: "2026-01-05",
    uploadedBy: "Sarah Chen",
    uploadedById: "a1",
    status: "Pending Review",
    projectId: "p5",
    milestoneId: "m5",
  },
]

export const notes: Note[] = [
  {
    id: "n1",
    content: "Client requested additional security features for the API integration. Need to update the quote.",
    type: "Client",
    authorId: "a1",
    authorName: "Sarah Chen",
    createdAt: "2026-01-05T10:30:00Z",
    projectId: "p1",
  },
  {
    id: "n2",
    content: "Vendor confirmed availability for Q1 2026. Proceed with contract finalization.",
    type: "Costing",
    authorId: "a2",
    authorName: "Marcus Johnson",
    createdAt: "2026-01-04T14:15:00Z",
    projectId: "p1",
  },
  {
    id: "n3",
    content: "Risk identified: potential delay in data export from legacy system. Escalating to management.",
    type: "Risk",
    authorId: "a4",
    authorName: "David Kim",
    createdAt: "2026-01-03T09:00:00Z",
    projectId: "p3",
  },
  {
    id: "n4",
    content: "Budget approved for additional resources. Can now proceed with parallel workstreams.",
    type: "Finance",
    authorId: "a3",
    authorName: "Emily Rodriguez",
    createdAt: "2026-01-02T16:45:00Z",
    projectId: "p2",
  },
]

export const costingRequests: CostingRequest[] = [
  {
    id: "cr1",
    title: "Additional Cloud Infrastructure",
    projectId: "p1",
    requestedAmount: 15000,
    items: "3x EC2 instances, 1x RDS database, S3 storage",
    agingDays: 3,
    status: "Submitted",
    requestedById: "a1",
    createdAt: "2026-01-03T10:00:00Z",
  },
  {
    id: "cr2",
    title: "Security Tools License",
    projectId: "p3",
    requestedAmount: 8000,
    items: "Annual license for penetration testing suite",
    agingDays: 7,
    status: "Approved",
    managerNotes: "Approved - critical for compliance requirements",
    requestedById: "a4",
    createdAt: "2025-12-30T14:00:00Z",
  },
  {
    id: "cr3",
    title: "Training Materials",
    projectId: "p5",
    requestedAmount: 2500,
    items: "User training videos, documentation templates",
    agingDays: 5,
    status: "Returned",
    managerNotes: "Please provide detailed breakdown of video production costs",
    requestedById: "a1",
    createdAt: "2026-01-01T09:30:00Z",
  },
  {
    id: "cr4",
    title: "Third-party Integration",
    projectId: "p2",
    requestedAmount: 5000,
    items: "API integration with payment gateway",
    agingDays: 1,
    status: "Draft",
    requestedById: "a3",
    createdAt: "2026-01-05T11:00:00Z",
  },
]
