"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Pipeline stages for new business acquisition
export type AcquisitionStage = 
  | "bid-evaluation"
  | "bid-manual"
  | "bid-pricing"
  | "consulting-vertical-lead"
  | "win"
  | "loss"

export const ACQUISITION_STAGES: { id: AcquisitionStage; title: string; description: string }[] = [
  { id: "bid-evaluation", title: "Bid Evaluation Process", description: "Initial evaluation of the business opportunity" },
  { id: "bid-manual", title: "Bid Manual", description: "Documentation and manual review process" },
  { id: "bid-pricing", title: "Bid Pricing Process", description: "Pricing strategy and proposal development" },
  { id: "consulting-vertical-lead", title: "Consulting Vertical Lead", description: "Leadership review and approval" },
  { id: "win", title: "Win", description: "Successfully acquired business" },
  { id: "loss", title: "Loss", description: "Did not win the business" },
]

export interface LeadContact {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  isPrimary: boolean
}

export interface LeadNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
}

export interface StageUpdate {
  stage: AcquisitionStage
  updatedAt: string
  updatedBy: string
  notes?: string
}

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

interface BusinessAcquisitionState {
  leads: BusinessLead[]
  
  // Lead management
  addLead: (lead: Omit<BusinessLead, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => string
  updateLead: (id: string, updates: Partial<BusinessLead>) => void
  deleteLead: (id: string) => void
  
  // Stage management
  moveToStage: (leadId: string, stage: AcquisitionStage, userId: string, notes?: string) => void
  
  // Win/Loss handling
  markAsWin: (leadId: string, userId: string, projectId?: string, clientId?: string) => void
  markAsLoss: (leadId: string, userId: string, reason: string, competitor?: string, notes?: string) => void
  
  // Notes
  addNote: (leadId: string, content: string, userId: string) => void
  
  // Contacts
  addContact: (leadId: string, contact: Omit<LeadContact, 'id'>) => void
  removeContact: (leadId: string, contactId: string) => void
  
  // Queries
  getLeadById: (id: string) => BusinessLead | undefined
  getLeadsByStage: (stage: AcquisitionStage) => BusinessLead[]
  getLeadsByOwner: (ownerId: string) => BusinessLead[]
  getLostLeads: () => BusinessLead[]
  getWonLeads: () => BusinessLead[]
}

// Sample data
const sampleLeads: BusinessLead[] = [
  {
    id: "lead-1",
    name: "Enterprise Cloud Migration",
    companyName: "TechCorp Industries",
    industry: "Technology",
    estimatedValue: 250000,
    currency: "USD",
    stage: "bid-pricing",
    leadOwnerId: "associate-1",
    contacts: [
      { id: "contact-1", name: "John Smith", role: "CTO", email: "john@techcorp.com", phone: "+1 555-0100", isPrimary: true },
      { id: "contact-2", name: "Sarah Johnson", role: "VP Engineering", email: "sarah@techcorp.com", isPrimary: false }
    ],
    description: "Large-scale cloud migration project for enterprise infrastructure",
    source: "Referral",
    probability: 65,
    expectedCloseDate: "2026-03-15",
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-01-20T14:30:00Z",
    stageHistory: [
      { stage: "bid-evaluation", updatedAt: "2026-01-05T10:00:00Z", updatedBy: "associate-1" },
      { stage: "bid-manual", updatedAt: "2026-01-10T09:00:00Z", updatedBy: "associate-1", notes: "Documentation complete" },
      { stage: "bid-pricing", updatedAt: "2026-01-15T11:00:00Z", updatedBy: "associate-1", notes: "Pricing proposal in review" }
    ],
    notes: [
      { id: "note-1", content: "Initial call went well, strong interest in our services", createdAt: "2026-01-05T15:00:00Z", createdBy: "associate-1" }
    ],
    tags: ["enterprise", "cloud", "high-value"]
  },
  {
    id: "lead-2",
    name: "Digital Transformation Initiative",
    companyName: "Global Finance Ltd",
    industry: "Financial Services",
    estimatedValue: 180000,
    currency: "USD",
    stage: "consulting-vertical-lead",
    leadOwnerId: "associate-2",
    contacts: [
      { id: "contact-3", name: "Michael Brown", role: "Director of IT", email: "m.brown@globalfinance.com", isPrimary: true }
    ],
    description: "End-to-end digital transformation for banking operations",
    source: "Website Inquiry",
    probability: 75,
    expectedCloseDate: "2026-02-28",
    createdAt: "2026-01-02T09:00:00Z",
    updatedAt: "2026-01-18T16:00:00Z",
    stageHistory: [
      { stage: "bid-evaluation", updatedAt: "2026-01-02T09:00:00Z", updatedBy: "associate-2" },
      { stage: "bid-manual", updatedAt: "2026-01-08T10:00:00Z", updatedBy: "associate-2" },
      { stage: "bid-pricing", updatedAt: "2026-01-12T14:00:00Z", updatedBy: "associate-2" },
      { stage: "consulting-vertical-lead", updatedAt: "2026-01-18T16:00:00Z", updatedBy: "associate-2", notes: "Awaiting leadership approval" }
    ],
    notes: [],
    tags: ["fintech", "digital-transformation"]
  },
  {
    id: "lead-3",
    name: "HR System Modernization",
    companyName: "PeopleFirst Corp",
    industry: "Human Resources",
    estimatedValue: 75000,
    currency: "USD",
    stage: "bid-evaluation",
    leadOwnerId: "associate-1",
    contacts: [
      { id: "contact-4", name: "Lisa Chen", role: "HR Director", email: "lisa@peoplefirst.com", isPrimary: true }
    ],
    description: "Modernize legacy HR systems with cloud-based solution",
    source: "Conference",
    probability: 40,
    expectedCloseDate: "2026-04-30",
    createdAt: "2026-01-19T11:00:00Z",
    updatedAt: "2026-01-19T11:00:00Z",
    stageHistory: [
      { stage: "bid-evaluation", updatedAt: "2026-01-19T11:00:00Z", updatedBy: "associate-1" }
    ],
    notes: [],
    tags: ["hr-tech", "saas"]
  },
  {
    id: "lead-4",
    name: "Supply Chain Optimization",
    companyName: "LogiMax Solutions",
    industry: "Logistics",
    estimatedValue: 120000,
    currency: "USD",
    stage: "loss",
    leadOwnerId: "associate-3",
    contacts: [
      { id: "contact-5", name: "Robert Wilson", role: "COO", email: "rwilson@logimax.com", isPrimary: true }
    ],
    description: "AI-powered supply chain optimization platform",
    source: "Partner Referral",
    probability: 0,
    expectedCloseDate: "2026-01-15",
    createdAt: "2025-11-10T08:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
    stageHistory: [
      { stage: "bid-evaluation", updatedAt: "2025-11-10T08:00:00Z", updatedBy: "associate-3" },
      { stage: "bid-manual", updatedAt: "2025-11-20T10:00:00Z", updatedBy: "associate-3" },
      { stage: "bid-pricing", updatedAt: "2025-12-01T14:00:00Z", updatedBy: "associate-3" },
      { stage: "consulting-vertical-lead", updatedAt: "2025-12-15T11:00:00Z", updatedBy: "associate-3" },
      { stage: "loss", updatedAt: "2026-01-15T09:00:00Z", updatedBy: "associate-3", notes: "Lost to competitor" }
    ],
    notes: [
      { id: "note-2", content: "Client decided to go with incumbent vendor", createdAt: "2026-01-15T09:30:00Z", createdBy: "associate-3" }
    ],
    tags: ["logistics", "ai"],
    lossReason: "Price",
    lossDate: "2026-01-15",
    lossNotes: "Client chose competitor due to lower pricing, despite our stronger technical proposal",
    competitorWon: "SupplyTech Inc"
  },
  {
    id: "lead-5",
    name: "E-commerce Platform Rebuild",
    companyName: "ShopSmart Retail",
    industry: "Retail",
    estimatedValue: 200000,
    currency: "USD",
    stage: "win",
    leadOwnerId: "associate-2",
    contacts: [
      { id: "contact-6", name: "Emily Davis", role: "CEO", email: "emily@shopsmart.com", isPrimary: true }
    ],
    description: "Complete rebuild of e-commerce platform with modern architecture",
    source: "Cold Outreach",
    probability: 100,
    expectedCloseDate: "2026-01-10",
    createdAt: "2025-10-15T09:00:00Z",
    updatedAt: "2026-01-10T15:00:00Z",
    stageHistory: [
      { stage: "bid-evaluation", updatedAt: "2025-10-15T09:00:00Z", updatedBy: "associate-2" },
      { stage: "bid-manual", updatedAt: "2025-10-25T10:00:00Z", updatedBy: "associate-2" },
      { stage: "bid-pricing", updatedAt: "2025-11-05T14:00:00Z", updatedBy: "associate-2" },
      { stage: "consulting-vertical-lead", updatedAt: "2025-11-20T11:00:00Z", updatedBy: "associate-2" },
      { stage: "win", updatedAt: "2026-01-10T15:00:00Z", updatedBy: "associate-2", notes: "Contract signed!" }
    ],
    notes: [],
    tags: ["e-commerce", "retail"],
    winDate: "2026-01-10",
    convertedProjectId: "proj-shoptech"
  }
]

export const useBusinessAcquisitionStore = create<BusinessAcquisitionState>()(
  persist(
    (set, get) => ({
      leads: sampleLeads,

      addLead: (leadData) => {
        const id = `lead-${Date.now()}`
        const now = new Date().toISOString()
        const newLead: BusinessLead = {
          ...leadData,
          id,
          createdAt: now,
          updatedAt: now,
          stageHistory: [{ stage: leadData.stage, updatedAt: now, updatedBy: leadData.leadOwnerId }]
        }
        set(state => ({ leads: [...state.leads, newLead] }))
        return id
      },

      updateLead: (id, updates) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === id
              ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
              : lead
          )
        }))
      },

      deleteLead: (id) => {
        set(state => ({ leads: state.leads.filter(lead => lead.id !== id) }))
      },

      moveToStage: (leadId, stage, userId, notes) => {
        const now = new Date().toISOString()
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead
            return {
              ...lead,
              stage,
              updatedAt: now,
              stageHistory: [...lead.stageHistory, { stage, updatedAt: now, updatedBy: userId, notes }]
            }
          })
        }))
      },

      markAsWin: (leadId, userId, projectId, clientId) => {
        const now = new Date().toISOString()
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead
            return {
              ...lead,
              stage: "win" as AcquisitionStage,
              probability: 100,
              winDate: now,
              convertedProjectId: projectId,
              convertedClientId: clientId,
              updatedAt: now,
              stageHistory: [...lead.stageHistory, { stage: "win" as AcquisitionStage, updatedAt: now, updatedBy: userId, notes: "Business won!" }]
            }
          })
        }))
      },

      markAsLoss: (leadId, userId, reason, competitor, notes) => {
        const now = new Date().toISOString()
        set(state => ({
          leads: state.leads.map(lead => {
            if (lead.id !== leadId) return lead
            return {
              ...lead,
              stage: "loss" as AcquisitionStage,
              probability: 0,
              lossReason: reason,
              lossDate: now,
              lossNotes: notes,
              competitorWon: competitor,
              updatedAt: now,
              stageHistory: [...lead.stageHistory, { stage: "loss" as AcquisitionStage, updatedAt: now, updatedBy: userId, notes: notes || `Lost: ${reason}` }]
            }
          })
        }))
      },

      addNote: (leadId, content, userId) => {
        const note: LeadNote = {
          id: `note-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          createdBy: userId
        }
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, notes: [...lead.notes, note], updatedAt: new Date().toISOString() }
              : lead
          )
        }))
      },

      addContact: (leadId, contact) => {
        const newContact: LeadContact = { ...contact, id: `contact-${Date.now()}` }
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, contacts: [...lead.contacts, newContact], updatedAt: new Date().toISOString() }
              : lead
          )
        }))
      },

      removeContact: (leadId, contactId) => {
        set(state => ({
          leads: state.leads.map(lead =>
            lead.id === leadId
              ? { ...lead, contacts: lead.contacts.filter(c => c.id !== contactId), updatedAt: new Date().toISOString() }
              : lead
          )
        }))
      },

      getLeadById: (id) => get().leads.find(lead => lead.id === id),
      
      getLeadsByStage: (stage) => get().leads.filter(lead => lead.stage === stage),
      
      getLeadsByOwner: (ownerId) => get().leads.filter(lead => lead.leadOwnerId === ownerId),
      
      getLostLeads: () => get().leads.filter(lead => lead.stage === "loss"),
      
      getWonLeads: () => get().leads.filter(lead => lead.stage === "win"),
    }),
    { name: "business-acquisition-store" }
  )
)
