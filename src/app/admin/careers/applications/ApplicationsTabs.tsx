'use client'

import { useSearchParams } from 'next/navigation'
import ApplicationsList from './ApplicationsList'
import EmailSender from '../emails/EmailSender'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Mail } from 'lucide-react'

interface Application {
  id: string
  full_name: string
  email: string
  status: string
  submitted_at: string
  resume_url: string
  job_id: string
  jobs?: {
    title: string
  }
}

export default function ApplicationsTabs({ applications }: { applications: Application[] }) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'emails' ? 'emails' : 'applications'

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-muted/50 p-1">
        <TabsTrigger 
          value="applications" 
          className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
        >
          <Users className="w-4 h-4 mr-2" />
          Applications
        </TabsTrigger>
        <TabsTrigger 
          value="emails" 
          className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Management
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="applications" className="mt-6">
        <ApplicationsList applications={applications} />
      </TabsContent>
      
      <TabsContent value="emails" className="mt-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-primary">Email Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Send acceptance and rejection emails to applicants. Select applicants and choose the email type to send professional notifications.
                </p>
              </div>
              <a
                href="/admin/careers/emails/templates"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
              >
                Edit Templates
              </a>
            </div>
          </div>
          <EmailSender applications={applications} />
        </div>
      </TabsContent>
    </Tabs>
  )
}

