export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-8 space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded-md mb-2" />
        <div className="h-4 w-80 bg-slate-100 rounded-md" />
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-300 rounded" />
          </div>
        ))}
      </div>

      {/* Distribución de estados */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Lista de evaluaciones recientes */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="h-4 w-48 bg-slate-200 rounded mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
