export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-0">{children}</div>
    </div>
  )
}
