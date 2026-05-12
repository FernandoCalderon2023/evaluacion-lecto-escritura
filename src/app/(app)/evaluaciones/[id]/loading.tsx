export default function ResultadoLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-20 bg-slate-200 rounded" />
        </div>
      </div>

      <div className="h-8 w-48 bg-slate-200 rounded-full" />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 h-72" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 h-16" />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 h-32" />
      <div className="bg-white border border-slate-200 rounded-lg p-5 h-48" />
    </div>
  )
}
