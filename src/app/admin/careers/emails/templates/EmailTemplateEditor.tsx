'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, Code2, Loader2, Mail, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

const DEFAULT_ACCEPTANCE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Accepted</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #E10112 0%, #c70110 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Congratulations, {applicantName}!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      We're thrilled to inform you that your application for the <strong>{jobTitle}</strong> position has been accepted!
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      Your skills and experience stood out among many candidates, and we believe you'll be a valuable addition to our team.
    </p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #1e40af;">
        <strong>Next Steps:</strong><br>
        Our team will reach out to you shortly with further details about the onboarding process and to discuss the next steps.
      </p>
    </div>
    
    <p style="font-size: 16px; margin: 30px 0 0 0;">
      We're excited to welcome you to Goia!
    </p>
    
    <p style="font-size: 16px; margin: 20px 0 0 0;">
      Best regards,<br>
      <strong>The Goia Careers Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      Goia Careers | careers@goia.app
    </p>
  </div>
</body>
</html>`

const DEFAULT_REJECTION = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; border: 1px solid #e5e7eb; border-bottom: none;">
    <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Thank you, {applicantName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      Thank you for your interest in joining Goia and for taking the time to apply for the <strong>{jobTitle}</strong> position.
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this role.
    </p>
    
    <p style="font-size: 16px; margin: 0 0 20px 0;">
      We appreciate the effort you put into your application and encourage you to keep an eye on our careers page for future opportunities that may be a better fit.
    </p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #92400e;">
        We value your interest in Goia and wish you the best in your career journey.
      </p>
    </div>
    
    <p style="font-size: 16px; margin: 30px 0 0 0;">
      Best regards,<br>
      <strong>The Goia Careers Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      Goia Careers | careers@goia.app
    </p>
  </div>
</body>
</html>`

export default function EmailTemplateEditor() {
  const { toast } = useToast()
  const [acceptanceTemplate, setAcceptanceTemplate] = useState(DEFAULT_ACCEPTANCE)
  const [rejectionTemplate, setRejectionTemplate] = useState(DEFAULT_REJECTION)
  const [saving, setSaving] = useState(false)
  const [previewData, setPreviewData] = useState({
    applicantName: 'John Doe',
    jobTitle: 'Senior Software Engineer',
  })
  const [activeTab, setActiveTab] = useState<'acceptance' | 'rejection'>('acceptance')

  useEffect(() => {
    // Load saved templates from localStorage
    const savedAcceptance = localStorage.getItem('email_template_acceptance')
    const savedRejection = localStorage.getItem('email_template_rejection')
    if (savedAcceptance) setAcceptanceTemplate(savedAcceptance)
    if (savedRejection) setRejectionTemplate(savedRejection)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage (in production, you'd save to database)
      localStorage.setItem('email_template_acceptance', acceptanceTemplate)
      localStorage.setItem('email_template_rejection', rejectionTemplate)
      
      toast({
        title: 'Templates saved successfully',
        description: 'Your email templates have been saved and will be used for future emails.',
      })
    } catch (error) {
      toast({
        title: 'Failed to save templates',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getPreview = (template: string) => {
    return template
      .replace(/{applicantName}/g, previewData.applicantName)
      .replace(/{jobTitle}/g, previewData.jobTitle)
  }

  const currentTemplate = activeTab === 'acceptance' ? acceptanceTemplate : rejectionTemplate
  const setCurrentTemplate = activeTab === 'acceptance' ? setAcceptanceTemplate : setRejectionTemplate

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">Edit Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use placeholders: {'{'}applicantName{'}'}, {'{'}jobTitle{'}'}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Templates
              </>
            )}
          </Button>
        </div>

        <Alert className="mb-4">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Templates are saved in your browser's local storage. To make them permanent, integrate with your database.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'acceptance' | 'rejection')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="acceptance" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Acceptance Email
            </TabsTrigger>
            <TabsTrigger value="rejection" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Rejection Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="acceptance" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Code2 className="w-4 h-4" /> HTML Code
                </div>
                <Textarea
                  value={acceptanceTemplate}
                  onChange={(e) => setAcceptanceTemplate(e.target.value)}
                  className="font-mono text-sm min-h-[500px]"
                  placeholder="Enter HTML template..."
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Eye className="w-4 h-4" /> Preview
                </div>
                <div className="rounded-lg border border-primary/10 bg-white p-4 min-h-[500px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: getPreview(acceptanceTemplate) }} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rejection" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Code2 className="w-4 h-4" /> HTML Code
                </div>
                <Textarea
                  value={rejectionTemplate}
                  onChange={(e) => setRejectionTemplate(e.target.value)}
                  className="font-mono text-sm min-h-[500px]"
                  placeholder="Enter HTML template..."
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Eye className="w-4 h-4" /> Preview
                </div>
                <div className="rounded-lg border border-primary/10 bg-white p-4 min-h-[500px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: getPreview(rejectionTemplate) }} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground">
            <strong>Preview Data:</strong> You can customize the preview by editing the placeholder values. These are just for preview purposes.
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground">Applicant Name</label>
              <input
                type="text"
                value={previewData.applicantName}
                onChange={(e) => setPreviewData({ ...previewData, applicantName: e.target.value })}
                className="mt-1 w-full rounded-md border border-primary/10 bg-white px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Job Title</label>
              <input
                type="text"
                value={previewData.jobTitle}
                onChange={(e) => setPreviewData({ ...previewData, jobTitle: e.target.value })}
                className="mt-1 w-full rounded-md border border-primary/10 bg-white px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

