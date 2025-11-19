'use client'

import { useState, useEffect, useMemo } from 'react'
import { Save, Eye, Code2, Loader2, Mail, CheckCircle, XCircle, Plus, Trash2, Star, Copy, Search, HelpCircle, Maximize2, Minimize2, Zap } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

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

const PLACEHOLDERS = [
  { key: '{applicantName}', description: 'Applicant\'s full name' },
  { key: '{jobTitle}', description: 'Job title they applied for' },
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [fullScreenPreview, setFullScreenPreview] = useState(false)
  const [showPlaceholders, setShowPlaceholders] = useState(false)

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

  const handleDuplicate = async (template: EmailTemplate) => {
    setSelectedTemplate(null)
    setTemplateName(`${template.name} (Copy)`)
    setTemplateSubject(template.subject)
    setTemplateContent(template.html_content)
    setTemplateType(template.type)
    setIsDefault(false)
    toast({
      title: 'Template duplicated',
      description: 'You can now edit and save the duplicated template.',
    })
  }

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.querySelector('textarea[placeholder*="HTML"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = templateContent
      const newText = text.substring(0, start) + placeholder + text.substring(end)
      setTemplateContent(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length)
      }, 0)
    }
    setShowPlaceholders(false)
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
      const url = '/api/email-templates'
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

  const filteredTemplates = useMemo(() => {
    const filtered = templates.filter(t => t.type === activeTab)
    if (!searchQuery) return filtered
    const query = searchQuery.toLowerCase()
    return filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query)
    )
  }, [templates, activeTab, searchQuery])

  const hasPlaceholders = useMemo(() => {
    return PLACEHOLDERS.some(p => 
      templateContent.includes(p.key) || templateSubject.includes(p.key)
    )
  }, [templateContent, templateSubject])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="rounded-3xl border border-primary/10 bg-white/95 shadow-lg backdrop-blur-sm p-4 md:p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold text-primary">Email Templates</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your email templates. Use placeholders: {'{'}applicantName{'}'}, {'{'}jobTitle{'}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={showPlaceholders} onOpenChange={setShowPlaceholders}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Placeholders</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Available Placeholders</h4>
                  {PLACEHOLDERS.map((placeholder) => (
                    <div
                      key={placeholder.key}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => insertPlaceholder(placeholder.key)}
                    >
                      <div>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{placeholder.key}</code>
                        <p className="text-xs text-muted-foreground mt-1">{placeholder.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Zap className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4" /> 
                  <span className="hidden sm:inline">New Template</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'accepted' | 'rejected')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accepted" className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4" /> 
              <span className="hidden sm:inline">Acceptance Email</span>
              <span className="sm:hidden">Acceptance</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2 text-xs sm:text-sm">
              <XCircle className="w-4 h-4" /> 
              <span className="hidden sm:inline">Rejection Email</span>
              <span className="sm:hidden">Rejection</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Template Selector with Search */}
            {filteredTemplates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Template</Label>
                  {filteredTemplates.length > 3 && (
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 sm:p-3 cursor-pointer transition flex-1 min-w-[200px] ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template.is_default && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary flex-shrink-0" />}
                      <span className="text-xs sm:text-sm font-medium truncate flex-1">{template.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(template)
                          }}
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(template.id)
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Editor */}
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4 order-2 lg:order-1">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Standard Acceptance Email"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Email Subject</Label>
                    <div className="flex gap-2">
                      <Input
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        placeholder="e.g., Congratulations! Your application has been accepted"
                        className="flex-1"
                      />
                      {hasPlaceholders && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Variables
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-default"
                      checked={isDefault}
                      onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                    />
                    <Label htmlFor="is-default" className="cursor-pointer text-sm">
                      Set as default template
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Code2 className="w-4 h-4" /> HTML Code
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPlaceholders(!showPlaceholders)}
                        className="h-7 text-xs"
                      >
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Help
                      </Button>
                    </div>
                    <Textarea
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      className="font-mono text-xs sm:text-sm min-h-[300px] sm:min-h-[400px] w-full"
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
                <div className="space-y-2 order-1 lg:order-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Eye className="w-4 h-4" /> Preview
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFullScreenPreview(!fullScreenPreview)}
                      className="h-7"
                    >
                      {fullScreenPreview ? (
                        <>
                          <Minimize2 className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Fullscreen</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className={`rounded-lg border border-primary/10 bg-white p-2 sm:p-4 overflow-auto ${
                    fullScreenPreview 
                      ? 'fixed inset-4 z-50 bg-white shadow-2xl' 
                      : 'min-h-[300px] sm:min-h-[400px]'
                  }`}>
                    {fullScreenPreview && (
                      <div className="sticky top-0 bg-white border-b pb-2 mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">Email Preview</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFullScreenPreview(false)}
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Applicant Name</Label>
              <Input
                type="text"
                value={previewData.applicantName}
                onChange={(e) => setPreviewData({ ...previewData, applicantName: e.target.value })}
                className="mt-1 text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Job Title</Label>
              <Input
                type="text"
                value={previewData.jobTitle}
                onChange={(e) => setPreviewData({ ...previewData, jobTitle: e.target.value })}
                className="mt-1 text-sm h-8"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
