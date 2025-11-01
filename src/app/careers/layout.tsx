export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary/5 to-primary/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-0">{children}</div>
    </div>
  )
}
