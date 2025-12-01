import EmailTemplateEditor from './EmailTemplateEditor'

export default async function EmailTemplatesPage() {
  return (
    <div className="space-y-8 w-full">
      <header className="rounded-3xl border border-primary/10 bg-white/95 shadow-2xl backdrop-blur-sm p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-primary">Email Templates</h1>
          <p className="text-sm text-muted-foreground">
            Customize your acceptance and rejection email templates. Use placeholders like {'{'}applicantName{'}'} and {'{'}jobTitle{'}'} that will be replaced automatically.
          </p>
        </div>
      </header>

      <div className="w-full">
        <EmailTemplateEditor />
      </div>
    </div>
  )
}

