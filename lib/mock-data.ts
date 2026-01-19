export type ProjectLifecycle = "new-business" | "onboarding" | "execution" | "closure" | "learnings" | "completed"
export type ProjectHealth = "on-track" | "at-risk" | "critical-risk"
export type FinanceReadiness = "quote" | "invoice" | "overdue" | "paid"

export type ClientStatus = "active" | "prospect" | "inactive" | "churned"
export type ClientTier = "enterprise" | "mid-market" | "startup"
export type ClientType = "standard" | "advisory"

export interface ClientContact {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  isPrimary: boolean
}

export interface ClientHealthFactor {
  factor: string
  score: number // 0-100
  weight: number // 0-1, sum of all weights = 1
  description: string
}

export interface ClientHealthHistoryEntry {
  date: string
  score: number
  factors: ClientHealthFactor[]
  note?: string
  updatedBy?: string
  isManualOverride?: boolean
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
  clientType: ClientType
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
  healthOverride?: number | null // Manual override, null means auto-calculate
  healthFactors?: ClientHealthFactor[]
  healthHistory?: ClientHealthHistoryEntry[]
  healthNotes?: string
  healthAlerts?: string[]
  notes: string
  tags: string[]
  createdAt: string
  retainer?: {
    monthlyFee: number
    startDate: string
    endDate?: string
    hoursIncluded: number
    hoursUsed: number
    services: string[]
    advisorId?: string
    status: "active" | "paused" | "expired"
  }
}

export interface Project {
  id: string
  name: string
  client: string
  status: "Onboarding" | "Execution" | "Blocked" | "Closed"
  lifecycle: ProjectLifecycle
  health: ProjectHealth
  onboardingStep?: number
  newBusinessStep?: number
  executionStep?: number
  closureStep?: number
  learningsStep?: number
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
  associate: string
  associateId: string
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

export const NEW_BUSINESS_STEPS = [
  { step: 1, label: "Lead Generated" },
  { step: 2, label: "Opportunity Evaluation" },
  { step: 3, label: "Emica Bidding Decision" },
  { step: 4, label: "Bid Team Assembled & Briefed" },
  { step: 5, label: "Solution Architecture" },
  { step: 6, label: "Technical Bid Preparation" },
  { step: 7, label: "Commercial Bid Preparation" },
  { step: 8, label: "Commercial Bid Sign Off" },
  { step: 9, label: "Technical Bid Sign Off" },
  { step: 10, label: "Bid Submission" },
  { step: 11, label: "Bid Pitch" },
  { step: 12, label: "Commercial Negotiations" },
] as const

export const EXECUTION_STEPS = [
  { step: 1, label: "Project Kickoff" },
  { step: 2, label: "Requirements Finalization" },
  { step: 3, label: "Design Phase" },
  { step: 4, label: "Development Sprint 1" },
  { step: 5, label: "Development Sprint 2" },
  { step: 6, label: "Development Sprint 3" },
  { step: 7, label: "Integration Testing" },
  { step: 8, label: "User Acceptance Testing" },
  { step: 9, label: "Bug Fixes & Refinement" },
  { step: 10, label: "Final Review" },
  { step: 11, label: "Go-Live Preparation" },
  { step: 12, label: "Go-Live & Handover" },
] as const

export const CLOSURE_STEPS = [
  { step: 1, label: "Project Completion Sign-off" },
  { step: 2, label: "Final Deliverables Handover" },
  { step: 3, label: "Knowledge Transfer" },
  { step: 4, label: "Documentation Finalization" },
  { step: 5, label: "Final Invoice Generation" },
  { step: 6, label: "Payment Collection" },
  { step: 7, label: "Client Satisfaction Survey" },
  { step: 8, label: "Internal Retrospective" },
  { step: 9, label: "Resource Release" },
  { step: 10, label: "Archive Project Files" },
] as const

export const LEARNINGS_STEPS = [
  { step: 1, label: "Lessons Learned Workshop" },
  { step: 2, label: "Success Factors Documentation" },
  { step: 3, label: "Challenge Analysis" },
  { step: 4, label: "Process Improvement Recommendations" },
  { step: 5, label: "Best Practices Update" },
  { step: 6, label: "Team Feedback Collection" },
  { step: 7, label: "Client Testimonial Request" },
  { step: 8, label: "Case Study Creation" },
  { step: 9, label: "Knowledge Base Update" },
  { step: 10, label: "Final Archive & Close" },
] as const

export const PIPELINE_CONFIG = {
  "new-business": {
    name: "New Business Acquisition",
    steps: NEW_BUSINESS_STEPS,
    stepField: "newBusinessStep" as const,
  },
  onboarding: {
    name: "Project Onboarding",
    steps: ONBOARDING_STEPS,
    stepField: "onboardingStep" as const,
  },
  execution: {
    name: "Project Execution",
    steps: EXECUTION_STEPS,
    stepField: "executionStep" as const,
  },
  closure: {
    name: "Project Closure",
    steps: CLOSURE_STEPS,
    stepField: "closureStep" as const,
  },
  learnings: {
    name: "Project Learnings",
    steps: LEARNINGS_STEPS,
    stepField: "learningsStep" as const,
  },
  completed: {
    name: "Completed",
    steps: [],
    stepField: null,
  },
} as const

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
  {
    id: "a5",
    name: "Aisha Patel",
    email: "aisha.patel@company.com",
    avatar: "/professional-woman-avatar-2.png",
    role: "Associate",
    activeProjects: 3,
    openTasks: 7,
    milestonesOverdue: 0,
    avgCycleTime: 2.0,
    performanceScore: 86,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 9 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.0 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.1 }],
    topDelayReasons: ["Awaiting client approval"],
    phone: "+1 (555) 567-8901",
    department: "Client Services",
    location: "Austin, TX",
    startDate: "2023-09-15",
    manager: "David Kim",
    managerId: "a4",
    bio: "Detail-oriented associate with strong analytical skills.",
    strengths: ["Data Analysis", "Process Documentation", "Quality Assurance"],
    skills: [
      { name: "Excel", level: "expert", yearsExp: 5 },
      { name: "SQL", level: "advanced", yearsExp: 3 },
      { name: "Tableau", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Hindi", proficiency: "fluent" },
    ],
    availability: "available",
    maxCapacity: 4,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "17:00", type: "remote" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "17:00", type: "remote" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a6",
    name: "James Wilson",
    email: "james.wilson@company.com",
    avatar: "/professional-man-avatar-2.png",
    role: "Senior Associate",
    activeProjects: 4,
    openTasks: 11,
    milestonesOverdue: 1,
    avgCycleTime: 2.2,
    performanceScore: 89,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 12 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.2 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 0.9 }],
    topDelayReasons: ["Technical complexity"],
    phone: "+1 (555) 678-9012",
    department: "Technical Solutions",
    location: "Seattle, WA",
    startDate: "2021-04-01",
    manager: "David Kim",
    managerId: "a4",
    bio: "Technical expert specializing in cloud architecture and integrations.",
    strengths: ["Cloud Architecture", "System Design", "Technical Leadership"],
    skills: [
      { name: "AWS", level: "expert", yearsExp: 6 },
      { name: "Azure", level: "advanced", yearsExp: 4 },
      { name: "Python", level: "expert", yearsExp: 7 },
    ],
    certifications: [
      { name: "AWS Solutions Architect Professional", issuer: "Amazon", date: "2023-05-10" },
    ],
    languages: [{ language: "English", proficiency: "native" }],
    availability: "available",
    maxCapacity: 5,
    schedule: [
      { dayOfWeek: "monday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "08:00", endTime: "17:00", type: "remote" },
      { dayOfWeek: "thursday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "friday", startTime: "08:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a7",
    name: "Fatima Al-Hassan",
    email: "fatima.h@company.com",
    avatar: "/professional-woman-avatar-3.png",
    role: "Associate",
    activeProjects: 2,
    openTasks: 6,
    milestonesOverdue: 0,
    avgCycleTime: 1.9,
    performanceScore: 84,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 8 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 1.9 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.2 }],
    topDelayReasons: [],
    phone: "+971 50 123 4567",
    department: "Implementation",
    location: "Dubai, UAE",
    startDate: "2024-02-01",
    bio: "Implementation specialist with regional expertise in Middle East markets.",
    strengths: ["Regional Knowledge", "Arabic Support", "Client Relations"],
    skills: [
      { name: "Project Coordination", level: "advanced", yearsExp: 4 },
      { name: "Stakeholder Management", level: "advanced", yearsExp: 3 },
    ],
    certifications: [],
    languages: [
      { language: "English", proficiency: "fluent" },
      { language: "Arabic", proficiency: "native" },
    ],
    availability: "available",
    maxCapacity: 3,
    schedule: [
      { dayOfWeek: "sunday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "monday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "17:00", type: "office" },
    ],
    timeOff: [],
  },
  {
    id: "a8",
    name: "Carlos Mendez",
    email: "carlos.m@company.com",
    avatar: "/professional-man-avatar-3.png",
    role: "Associate",
    activeProjects: 3,
    openTasks: 9,
    milestonesOverdue: 1,
    avgCycleTime: 2.4,
    performanceScore: 81,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 7 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.4 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.4 }],
    topDelayReasons: ["Resource constraints"],
    phone: "+52 55 1234 5678",
    department: "Client Services",
    location: "Mexico City, MX",
    startDate: "2023-11-01",
    bio: "Bilingual associate supporting LATAM region clients.",
    strengths: ["Bilingual Support", "Client Communication", "Training"],
    skills: [
      { name: "Client Relations", level: "advanced", yearsExp: 4 },
      { name: "Training Delivery", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [],
    languages: [
      { language: "Spanish", proficiency: "native" },
      { language: "English", proficiency: "fluent" },
    ],
    availability: "available",
    maxCapacity: 4,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "18:00", type: "remote" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a9",
    name: "Priya Sharma",
    email: "priya.sharma@company.com",
    avatar: "/professional-woman-avatar-4.png",
    role: "Senior Associate",
    activeProjects: 4,
    openTasks: 10,
    milestonesOverdue: 0,
    avgCycleTime: 1.7,
    performanceScore: 91,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 13 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 1.7 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 0.8 }],
    topDelayReasons: [],
    phone: "+91 98765 43210",
    department: "Implementation",
    location: "Bangalore, IN",
    startDate: "2022-01-15",
    bio: "High-performing senior associate with expertise in data migrations.",
    strengths: ["Data Migration", "ETL", "Quality Assurance", "Technical Documentation"],
    skills: [
      { name: "SQL", level: "expert", yearsExp: 6 },
      { name: "Python", level: "advanced", yearsExp: 4 },
      { name: "ETL Tools", level: "expert", yearsExp: 5 },
    ],
    certifications: [
      { name: "Google Cloud Professional Data Engineer", issuer: "Google", date: "2024-01-15" },
    ],
    languages: [
      { language: "English", proficiency: "fluent" },
      { language: "Hindi", proficiency: "native" },
      { language: "Kannada", proficiency: "native" },
    ],
    availability: "available",
    maxCapacity: 5,
    schedule: [
      { dayOfWeek: "monday", startTime: "10:00", endTime: "19:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "10:00", endTime: "19:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "10:00", endTime: "19:00", type: "remote" },
      { dayOfWeek: "thursday", startTime: "10:00", endTime: "19:00", type: "office" },
      { dayOfWeek: "friday", startTime: "10:00", endTime: "18:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a10",
    name: "Michael O'Brien",
    email: "michael.ob@company.com",
    avatar: "/professional-man-avatar-4.png",
    role: "Associate",
    activeProjects: 2,
    openTasks: 5,
    milestonesOverdue: 0,
    avgCycleTime: 2.1,
    performanceScore: 83,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 6 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.1 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.3 }],
    topDelayReasons: ["Client availability"],
    phone: "+353 1 234 5678",
    department: "Client Services",
    location: "Dublin, IE",
    startDate: "2024-06-01",
    bio: "Associate supporting European clients with strong finance background.",
    strengths: ["Financial Analysis", "Reporting", "EMEA Knowledge"],
    skills: [
      { name: "Financial Analysis", level: "advanced", yearsExp: 5 },
      { name: "Excel", level: "expert", yearsExp: 6 },
      { name: "SAP", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Irish", proficiency: "conversational" },
    ],
    availability: "available",
    maxCapacity: 3,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "17:30", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "17:30", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "17:30", type: "remote" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "17:30", type: "office" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a11",
    name: "Yuki Tanaka",
    email: "yuki.t@company.com",
    avatar: "/professional-woman-avatar-5.png",
    role: "Associate",
    activeProjects: 3,
    openTasks: 8,
    milestonesOverdue: 1,
    avgCycleTime: 2.3,
    performanceScore: 82,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 7 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.3 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.5 }],
    topDelayReasons: ["Translation delays"],
    phone: "+81 3 1234 5678",
    department: "Implementation",
    location: "Tokyo, JP",
    startDate: "2023-04-01",
    bio: "Associate with expertise in Japanese market implementations.",
    strengths: ["Japanese Market Knowledge", "Localization", "Quality Control"],
    skills: [
      { name: "Localization", level: "advanced", yearsExp: 4 },
      { name: "Project Coordination", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [],
    languages: [
      { language: "Japanese", proficiency: "native" },
      { language: "English", proficiency: "fluent" },
    ],
    availability: "available",
    maxCapacity: 4,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "18:00", type: "remote" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "17:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a12",
    name: "Ahmed Hassan",
    email: "ahmed.h@company.com",
    avatar: "/professional-man-avatar-5.png",
    role: "Senior Associate",
    activeProjects: 5,
    openTasks: 14,
    milestonesOverdue: 0,
    avgCycleTime: 1.6,
    performanceScore: 93,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 15 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 1.6 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 0.7 }],
    topDelayReasons: [],
    phone: "+966 50 987 6543",
    department: "Technical Solutions",
    location: "Riyadh, SA",
    startDate: "2021-09-01",
    bio: "Senior technical specialist leading GCC region implementations.",
    strengths: ["Technical Leadership", "GCC Market", "Enterprise Architecture"],
    skills: [
      { name: "Solution Architecture", level: "expert", yearsExp: 7 },
      { name: "Oracle", level: "advanced", yearsExp: 5 },
      { name: "SAP", level: "advanced", yearsExp: 4 },
    ],
    certifications: [
      { name: "Oracle Cloud Infrastructure Architect Professional", issuer: "Oracle", date: "2023-08-20" },
    ],
    languages: [
      { language: "Arabic", proficiency: "native" },
      { language: "English", proficiency: "fluent" },
    ],
    availability: "available",
    maxCapacity: 6,
    schedule: [
      { dayOfWeek: "sunday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "monday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "08:00", endTime: "17:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "08:00", endTime: "17:00", type: "office" },
    ],
    timeOff: [],
  },
  {
    id: "a13",
    name: "Sophie Martin",
    email: "sophie.m@company.com",
    avatar: "/professional-woman-avatar-6.png",
    role: "Associate",
    activeProjects: 2,
    openTasks: 4,
    milestonesOverdue: 0,
    avgCycleTime: 1.8,
    performanceScore: 87,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 10 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 1.8 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.0 }],
    topDelayReasons: [],
    phone: "+33 1 23 45 67 89",
    department: "Client Services",
    location: "Paris, FR",
    startDate: "2024-03-15",
    bio: "Associate with expertise in European compliance and regulations.",
    strengths: ["Regulatory Compliance", "GDPR", "Documentation"],
    skills: [
      { name: "Compliance", level: "advanced", yearsExp: 4 },
      { name: "GDPR", level: "expert", yearsExp: 3 },
      { name: "Documentation", level: "advanced", yearsExp: 4 },
    ],
    certifications: [
      { name: "CIPP/E", issuer: "IAPP", date: "2023-11-10" },
    ],
    languages: [
      { language: "French", proficiency: "native" },
      { language: "English", proficiency: "fluent" },
      { language: "German", proficiency: "conversational" },
    ],
    availability: "available",
    maxCapacity: 3,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "18:00", type: "remote" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "16:00", type: "remote" },
    ],
    timeOff: [],
  },
  {
    id: "a14",
    name: "Raj Krishnan",
    email: "raj.k@company.com",
    avatar: "/professional-man-avatar-6.png",
    role: "Associate",
    activeProjects: 3,
    openTasks: 7,
    milestonesOverdue: 0,
    avgCycleTime: 2.0,
    performanceScore: 85,
    tasksCompletedHistory: [{ date: "2026-01-05", count: 9 }],
    cycleTimeHistory: [{ date: "2026-01-05", time: 2.0 }],
    approvalTurnaroundHistory: [{ date: "2026-01-05", time: 1.1 }],
    topDelayReasons: ["Cross-team dependencies"],
    phone: "+65 9876 5432",
    department: "Implementation",
    location: "Singapore, SG",
    startDate: "2023-08-01",
    bio: "Implementation specialist for APAC region with fintech background.",
    strengths: ["Fintech", "APAC Markets", "Integration"],
    skills: [
      { name: "System Integration", level: "advanced", yearsExp: 4 },
      { name: "Fintech Systems", level: "advanced", yearsExp: 3 },
      { name: "API Development", level: "intermediate", yearsExp: 2 },
    ],
    certifications: [],
    languages: [
      { language: "English", proficiency: "native" },
      { language: "Tamil", proficiency: "fluent" },
      { language: "Mandarin", proficiency: "basic" },
    ],
    availability: "available",
    maxCapacity: 4,
    schedule: [
      { dayOfWeek: "monday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "tuesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "wednesday", startTime: "09:00", endTime: "18:00", type: "office" },
      { dayOfWeek: "thursday", startTime: "09:00", endTime: "18:00", type: "remote" },
      { dayOfWeek: "friday", startTime: "09:00", endTime: "17:00", type: "remote" },
    ],
    timeOff: [],
  },
]

export const clients: Client[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    industry: "Technology",
    domain: "Enterprise Software",
    employeeCount: 5000,
    foundedYear: 1995,
    status: "active",
    tier: "enterprise",
    clientType: "standard",
    website: "https://acme.com",
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
    healthOverride: null,
    healthFactors: [
      { factor: "Project Progress", score: 90, weight: 0.4, description: "Project is 65% complete." },
      { factor: "Client Satisfaction", score: 80, weight: 0.3, description: "Client feedback is positive." },
      { factor: "Associates Performance", score: 85, weight: 0.3, description: "Associates are meeting deadlines." },
    ],
    healthHistory: [
      { date: "2025-12-01", score: 80, factors: [], note: "Initial health score." },
      { date: "2025-12-15", score: 85, factors: [], note: "Progress update." },
    ],
    healthNotes: "Client is highly satisfied with the project progress.",
    healthAlerts: [],
    notes: "Strategic account. Expanding into new regions. Potential for additional service lines.",
    tags: ["strategic", "manufacturing", "automation"],
    createdAt: "2020-03-15",
  },
  {
    id: "c2",
    name: "TechStart Inc",
    industry: "SaaS",
    domain: "B2B Software",
    employeeCount: 150,
    foundedYear: 2018,
    status: "active",
    tier: "startup",
    clientType: "standard",
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
    healthOverride: null,
    healthFactors: [
      { factor: "Project Progress", score: 70, weight: 0.4, description: "Project is 25% complete." },
      { factor: "Client Satisfaction", score: 75, weight: 0.3, description: "Client feedback is mixed." },
      { factor: "Associates Performance", score: 70, weight: 0.3, description: "Associates are slightly delayed." },
    ],
    healthHistory: [
      { date: "2025-12-01", score: 70, factors: [], note: "Initial health score." },
      { date: "2025-12-15", score: 75, factors: [], note: "Progress update." },
    ],
    healthNotes: "Client is showing interest but requires more engagement.",
    healthAlerts: [],
    notes: "High growth potential. Currently in onboarding phase. CEO is highly engaged.",
    tags: ["high-growth", "saas", "hr-tech"],
    createdAt: "2025-05-20",
  },
  {
    id: "c3",
    name: "Global Retail Co",
    industry: "Retail",
    domain: "E-commerce",
    employeeCount: 25000,
    foundedYear: 1970,
    status: "active",
    tier: "enterprise",
    clientType: "standard",
    website: "https://globalretail.com",
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
    healthOverride: null,
    healthFactors: [
      { factor: "Project Progress", score: 50, weight: 0.4, description: "Projects are 20% behind schedule." },
      { factor: "Client Satisfaction", score: 40, weight: 0.3, description: "Client has escalated issues twice." },
      { factor: "Associates Performance", score: 45, weight: 0.3, description: "Associates are delayed." },
    ],
    healthHistory: [
      { date: "2025-12-01", score: 50, factors: [], note: "Initial health score." },
      { date: "2025-12-15", score: 45, factors: [], note: "Progress update." },
    ],
    healthNotes: "Client is facing challenges with data migration.",
    healthAlerts: [],
    notes: "Currently facing challenges with data migration. Requires executive attention. Risk of escalation.",
    tags: ["enterprise", "financial-services", "compliance", "at-risk"],
    createdAt: "2023-08-15",
  },
  {
    id: "c4",
    name: "Innovate Labs",
    industry: "Research",
    domain: "R&D Services",
    employeeCount: 80,
    foundedYear: 2020,
    status: "prospect",
    tier: "startup",
    clientType: "standard",
    website: "https://innovatelabs.co",
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
    healthOverride: null,
    healthFactors: [
      { factor: "Project Progress", score: 95, weight: 0.4, description: "All projects on track." },
      { factor: "Client Satisfaction", score: 90, weight: 0.3, description: "Client highly satisfied." },
      { factor: "Associates Performance", score: 95, weight: 0.3, description: "Associates are on track." },
    ],
    healthHistory: [
      { date: "2025-12-01", score: 90, factors: [], note: "Initial health score." },
      { date: "2025-12-15", score: 92, factors: [], note: "Progress update." },
    ],
    healthNotes: "Excellent relationship. Paid in full.",
    healthAlerts: [],
    notes: "Excellent relationship. Paid in full. Discussing expansion to additional facilities.",
    tags: ["healthcare", "digital-transformation", "expansion-opportunity"],
    createdAt: "2024-11-01",
    retainer: {
      monthlyFee: 15000,
      startDate: "2025-01-01",
      endDate: "2027-12-31",
      hoursIncluded: 100,
      hoursUsed: 75,
      services: ["Strategy Consulting", "System Integration Support", "Process Optimization"],
      advisorId: "a1",
      status: "active",
    },
  },
  {
    id: "c5",
    name: "Quantum Dynamics",
    industry: "Manufacturing",
    domain: "Industrial Automation",
    employeeCount: 2500,
    foundedYear: 1985,
    status: "active",
    tier: "mid-market",
    clientType: "advisory",
    website: "https://quantumdynamics.com",
    description:
      "Leading manufacturer of industrial automation solutions seeking strategic guidance on digital transformation.",
    address: {
      street: "500 Industrial Blvd",
      city: "Detroit",
      state: "MI",
      country: "USA",
      zip: "48201",
    },
    contacts: [
      {
        id: "cc5-1",
        name: "Robert Chen",
        role: "CEO",
        email: "r.chen@quantumdynamics.com",
        phone: "+1 313-555-0100",
        isPrimary: true,
      },
    ],
    contractStart: "2025-01-01",
    totalRevenue: 180000,
    outstandingBalance: 0,
    healthScore: 92,
    notes: "Long-term advisory client focused on digital transformation strategy",
    tags: ["Advisory", "Manufacturing", "Digital Transformation"],
    createdAt: "2025-01-01",
    retainer: {
      monthlyFee: 15000,
      startDate: "2025-01-01",
      hoursIncluded: 20,
      hoursUsed: 14,
      services: ["Strategic Planning", "Technology Assessment", "Executive Coaching", "Board Advisory"],
      advisorId: "a1",
      status: "active",
    },
  },
  {
    id: "c6",
    name: "HealthFirst Medical",
    industry: "Healthcare",
    domain: "Medical Services",
    employeeCount: 800,
    foundedYear: 2005,
    status: "active",
    tier: "mid-market",
    clientType: "advisory",
    website: "https://healthfirstmedical.com",
    description: "Regional healthcare provider seeking advisory support for operational excellence and compliance.",
    address: {
      street: "200 Medical Center Dr",
      city: "Boston",
      state: "MA",
      country: "USA",
      zip: "02115",
    },
    contacts: [
      {
        id: "cc6-1",
        name: "Dr. Amanda Foster",
        role: "Chief Medical Officer",
        email: "a.foster@healthfirst.com",
        phone: "+1 617-555-0200",
        isPrimary: true,
      },
    ],
    contractStart: "2025-06-01",
    totalRevenue: 60000,
    outstandingBalance: 10000,
    healthScore: 78,
    notes: "Advisory engagement focused on operational efficiency and regulatory compliance",
    tags: ["Advisory", "Healthcare", "Compliance"],
    createdAt: "2025-06-01",
    retainer: {
      monthlyFee: 10000,
      startDate: "2025-06-01",
      hoursIncluded: 15,
      hoursUsed: 18,
      services: ["Compliance Advisory", "Process Optimization", "Staff Training"],
      advisorId: "a2",
      status: "active",
    },
  },
  {
    id: "c7",
    name: "GreenTech Solutions",
    industry: "Clean Energy",
    domain: "Renewable Energy",
    employeeCount: 300,
    foundedYear: 2015,
    status: "active",
    tier: "startup",
    clientType: "advisory",
    website: "https://greentechsolutions.com",
    description: "Clean energy startup seeking advisory support for scaling operations and investor relations.",
    address: {
      street: "75 Solar Way",
      city: "Austin",
      state: "TX",
      country: "USA",
      zip: "78701",
    },
    contacts: [
      {
        id: "cc7-1",
        name: "Jennifer Wu",
        role: "Founder & CEO",
        email: "j.wu@greentech.com",
        phone: "+1 512-555-0300",
        isPrimary: true,
      },
    ],
    contractStart: "2025-09-01",
    contractEnd: "2026-03-01",
    totalRevenue: 30000,
    outstandingBalance: 0,
    healthScore: 88,
    notes: "6-month advisory engagement for Series B preparation",
    tags: ["Advisory", "Startup", "Fundraising"],
    createdAt: "2025-09-01",
    retainer: {
      monthlyFee: 7500,
      startDate: "2025-09-01",
      endDate: "2026-03-01",
      hoursIncluded: 12,
      hoursUsed: 8,
      services: ["Investor Relations", "Financial Modeling", "Growth Strategy"],
      advisorId: "a3",
      status: "active",
    },
  },
  {
    id: "c8", // Updated from c5 in original
    name: "RetailMax Group",
    industry: "Retail",
    status: "prospect",
    tier: "enterprise",
    clientType: "standard",
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
    contractStart: "2026-01-01",
    contractEnd: "2028-12-31",
    totalRevenue: 0,
    outstandingBalance: 0,
    healthScore: 0,
    healthOverride: null,
    healthFactors: [],
    healthHistory: [],
    healthNotes: "In discovery phase. RFP expected Q2 2026.",
    healthAlerts: [],
    notes: "In discovery phase. RFP expected Q2 2026. Strong fit for our supply chain services.",
    tags: ["prospect", "retail", "supply-chain"],
    createdAt: "2025-12-01",
  },
  {
    id: "c9", // Updated from c6 in original
    name: "EduTech Solutions",
    industry: "Education",
    status: "inactive",
    tier: "mid-market",
    clientType: "standard",
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
    healthOverride: null,
    healthFactors: [
      { factor: "Project Progress", score: 100, weight: 0.4, description: "Project is 100% complete." },
      { factor: "Client Satisfaction", score: 85, weight: 0.3, description: "Client feedback is positive." },
      { factor: "Associates Performance", score: 90, weight: 0.3, description: "Associates met all deadlines." },
    ],
    healthHistory: [
      { date: "2025-12-01", score: 75, factors: [], note: "Initial health score." },
      { date: "2025-12-15", score: 78, factors: [], note: "Progress update." },
    ],
    healthNotes: "Contract ended Dec 2024. Good relationship.",
    healthAlerts: [],
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
    milestones: [
      {
        id: "m1-p1",
        title: "Phase 1: Discovery & Planning",
        projectId: "p1",
        startDate: "2026-01-20",
        dueDate: "2026-02-21",
        status: "in-progress",
        completion: 60,
        blockers: [],
        tasks: [
          { id: "t1-m1", title: "Executive Interviews", projectId: "p1", milestoneId: "m1-p1", assigneeId: "a1", status: "in-progress", priority: "high", dueDate: "2026-01-31", timeStarted: "2026-01-20" },
          { id: "t2-m1", title: "Requirements Documentation", projectId: "p1", milestoneId: "m1-p1", assigneeId: "a2", status: "todo", priority: "high", dueDate: "2026-02-10" },
          { id: "t3-m1", title: "Gap Analysis Report", projectId: "p1", milestoneId: "m1-p1", assigneeId: "a1", status: "todo", priority: "medium", dueDate: "2026-02-18" },
          { id: "t4-m1", title: "Infrastructure Review", projectId: "p1", milestoneId: "m1-p1", assigneeId: "a6", status: "todo", priority: "high", dueDate: "2026-02-14" },
          { id: "t5-m1", title: "Integration Mapping", projectId: "p1", milestoneId: "m1-p1", assigneeId: "a6", status: "todo", priority: "medium", dueDate: "2026-02-21" },
        ]
      },
      {
        id: "m2-p1",
        title: "Phase 2: Implementation",
        projectId: "p1",
        startDate: "2026-02-24",
        dueDate: "2026-04-11",
        status: "not-started",
        completion: 0,
        blockers: [],
        tasks: [
          { id: "t1-m2", title: "Environment Configuration", projectId: "p1", milestoneId: "m2-p1", assigneeId: "a6", status: "todo", priority: "high", dueDate: "2026-03-07" },
          { id: "t2-m2", title: "Data Migration - Phase 1", projectId: "p1", milestoneId: "m2-p1", assigneeId: "a9", status: "todo", priority: "high", dueDate: "2026-03-21" },
          { id: "t3-m2", title: "Custom Module Development", projectId: "p1", milestoneId: "m2-p1", assigneeId: "a6", status: "todo", priority: "high", dueDate: "2026-04-04" },
          { id: "t4-m2", title: "Training Material Development", projectId: "p1", milestoneId: "m2-p1", assigneeId: "a2", status: "todo", priority: "medium", dueDate: "2026-03-28" },
          { id: "t5-m2", title: "End User Training Sessions", projectId: "p1", milestoneId: "m2-p1", assigneeId: "a2", status: "todo", priority: "medium", dueDate: "2026-04-11" },
        ]
      },
      {
        id: "m3-p1",
        title: "Phase 3: Go-Live & Support",
        projectId: "p1",
        startDate: "2026-04-14",
        dueDate: "2026-05-30",
        status: "not-started",
        completion: 0,
        blockers: [],
        tasks: [
          { id: "t1-m3", title: "UAT Support", projectId: "p1", milestoneId: "m3-p1", assigneeId: "a1", status: "todo", priority: "high", dueDate: "2026-04-25" },
          { id: "t2-m3", title: "Go-Live Execution", projectId: "p1", milestoneId: "m3-p1", assigneeId: "a4", status: "todo", priority: "high", dueDate: "2026-05-02" },
          { id: "t3-m3", title: "Post Go-Live Support", projectId: "p1", milestoneId: "m3-p1", assigneeId: "a3", status: "todo", priority: "medium", dueDate: "2026-05-23" },
          { id: "t4-m3", title: "Documentation & Handover", projectId: "p1", milestoneId: "m3-p1", assigneeId: "a2", status: "todo", priority: "low", dueDate: "2026-05-30" },
        ]
      }
    ],
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
    status: "Onboarding",
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
    associate: "Sarah Chen",
    associateId: "a1",
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
    associate: "Marcus Johnson",
    associateId: "a2",
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
    associate: "David Kim",
    associateId: "a4",
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
    associate: "Emily Rodriguez",
    associateId: "a3",
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
    associate: "Sarah Chen",
    associateId: "a1",
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
