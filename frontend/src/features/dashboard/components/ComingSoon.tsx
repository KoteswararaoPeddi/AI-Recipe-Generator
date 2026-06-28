export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-h1 font-bold text-foreground">{title}</h1>
      <p className="text-body-lg text-muted-foreground">This section is coming soon.</p>
    </div>
  )
}
