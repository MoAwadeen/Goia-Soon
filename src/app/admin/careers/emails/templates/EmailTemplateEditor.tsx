'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, Code2, Loader2, Mail, CheckCircle, XCircle, Plus, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface EmailTemplate {
  id: string
  name: string
  type: 'accepted' | 'rejected'
  subject: string
  html_content: string
  is_default: boolean
  created_at: string
  updated_at: string
}

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
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateContent, setTemplateContent] = useState('')
  const [templateType, setTemplateType] = useState<'accepted' | 'rejected'>('accepted')
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewData, setPreviewData] = useState({
    applicantName: 'John Doe',
    jobTitle: 'Senior Software Engineer',
  })
  const [activeTab, setActiveTab] = useState<'accepted' | 'rejected'>('accepted')
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (activeTab) {
      const defaultTemplate = templates.find(t => t.type === activeTab && t.is_default)
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate)
        setTemplateName(defaultTemplate.name)
        setTemplateSubject(defaultTemplate.subject)
        setTemplateContent(defaultTemplate.html_content)
        setTemplateType(defaultTemplate.type)
        setIsDefault(defaultTemplate.is_default)
      } else {
        // Reset to defaults
        setSelectedTemplate(null)
        setTemplateName('')
        setTemplateSubject(activeTab === 'accepted' ? 'Congratulations! Your application has been accepted' : 'Update on your application')
        setTemplateContent(activeTab === 'accepted' ? DEFAULT_ACCEPTANCE : DEFAULT_REJECTION)
        setTemplateType(activeTab)
        setIsDefault(false)
      }
    }
  }, [activeTab, templates])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/email-templates')
      const data = await response.json()
      if (response.ok) {
        setTemplates(data.templates || [])
      } else {
        toast({
          title: 'Failed to load templates',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to load templates',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setTemplateName(template.name)
    setTemplateSubject(template.subject)
    setTemplateContent(template.html_content)
    setTemplateType(template.type)
    setIsDefault(template.is_default)
  }

  const handleSave = async () => {
    if (!templateName || !templateSubject || !templateContent) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = selectedTemplate
        ? '/api/email-templates'
        : '/api/email-templates'
      
      const method = selectedTemplate ? 'PUT' : 'POST'
      
      const body = selectedTemplate
        ? {
            id: selectedTemplate.id,
            name: templateName,
            subject: templateSubject,
            html_content: templateContent,
            is_default: isDefault,
            type: templateType,
          }
        : {
            name: templateName,
            type: templateType,
            subject: templateSubject,
            html_content: templateContent,
            is_default: isDefault,
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Template saved successfully',
          description: 'Your email template has been saved.',
        })
        await loadTemplates()
        if (data.template) {
          handleTemplateSelect(data.template)
        }
      } else {
        toast({
          title: 'Failed to save template',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to save template',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      const response = await fetch(`/api/email-templates?id=${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Template deleted',
          description: 'The template has been deleted successfully.',
        })
        await loadTemplates()
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null)
          setTemplateName('')
          setTemplateSubject('')
          setTemplateContent('')
          setIsDefault(false)
        }
      } else {
        toast({
          title: 'Failed to delete template',
          description: 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to delete template',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    setTemplateName('')
    setTemplateSubject(activeTab === 'accepted' ? 'Congratulations! Your application has been accepted' : 'Update on your application')
    setTemplateContent(activeTab === 'accepted' ? DEFAULT_ACCEPTANCE : DEFAULT_REJECTION)
    setTemplateType(activeTab)
    setIsDefault(false)
    setIsNewTemplateDialogOpen(false)
  }

  const getPreview = (template: string) => {
    return template
      .replace(/{applicantName}/g, previewData.applicantName)
      .replace(/{jobTitle}/g, previewData.jobTitle)
  }

  const filteredTemplates = templates.filter(t => t.type === activeTab)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">Email Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your email templates. Use placeholders: {'{'}applicantName{'}'}, {'{'}jobTitle{'}'}
            </p>
          </div>
          <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" /> New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new email template. You can customize it after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Template Type</Label>
                  <Select value={templateType} onValueChange={(v) => setTemplateType(v as 'accepted' | 'rejected')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">Acceptance Email</SelectItem>
                      <SelectItem value="rejected">Rejection Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleNewTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'accepted' | 'rejected')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Acceptance Email
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Rejection Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Template Selector */}
            {filteredTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Select Template</Label>
                <div className="flex flex-wrap gap-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template.is_default && <Star className="w-4 h-4 text-primary fill-primary" />}
                      <span className="text-sm font-medium">{template.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(template.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Editor */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Standard Acceptance Email"
                    />
                  </div>
                  <div>
                    <Label>Email Subject</Label>
                    <Input
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      placeholder="e.g., Congratulations! Your application has been accepted"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-default"
                      checked={isDefault}
                      onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                    />
                    <Label htmlFor="is-default" className="cursor-pointer">
                      Set as default template
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Code2 className="w-4 h-4" /> HTML Code
                    </div>
                    <Textarea
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="Enter HTML template..."
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !templateName || !templateSubject || !templateContent}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> {selectedTemplate ? 'Update Template' : 'Save Template'}
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Eye className="w-4 h-4" /> Preview
                  </div>
                  <div className="rounded-lg border border-primary/10 bg-white p-4 min-h-[400px] overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: getPreview(templateContent) }} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Preview Data:</strong> Customize the preview values below.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <Label className="text-xs">Applicant Name</Label>
              <Input
                type="text"
                value={previewData.applicantName}
                onChange={(e) => setPreviewData({ ...previewData, applicantName: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Job Title</Label>
              <Input
                type="text"
                value={previewData.jobTitle}
                onChange={(e) => setPreviewData({ ...previewData, jobTitle: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
