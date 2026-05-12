export default function EvaluacionesLoading() {
  return (
    <div className="p-4 lg:p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-200 rounded-lg" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-slate-200 rounded-full" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-300 rounded" />
              <div className="h-3 w-60 bg-slate-100 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-4 w-16 bg-slate-100 rounded" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
