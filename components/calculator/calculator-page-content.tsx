'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { usePricingStore } from '@/lib/pricing-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Calculator, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Building2
} from 'lucide-react'

export function CalculatorPageContent() {
  const { projects, clients } = useStore()
  const { projectPricings, getProjectPricing } = usePricingStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clients.find(c => c.id === project.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate stats
  const pricedCount = projectPricings.filter(p => p.status === 'priced').length
  const inProgressCount = projectPricings.filter(p => p.status === 'in-progress').length
  const notPricedCount = projects.length - pricedCount - inProgressCount

  const getPricingStatus = (projectId: string) => {
    const pricing = getProjectPricing(projectId)
    return pricing?.status || 'not-priced'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'priced':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Priced
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Priced
          </Badge>
        )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Project Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Price and estimate project costs
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Priced Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{pricedCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{inProgressCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Not Priced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-600">{notPricedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects or clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead>Pricing Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map(project => {
                  const client = clients.find(c => c.id === project.clientId)
                  const status = getPricingStatus(project.id)
                  
                  return (
                    <TableRow key={project.id} className="group">
                      <TableCell>
                        <div className="font-medium">{project.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {client?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.lifecycle.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/calculator/${project.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Open Calculator
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
