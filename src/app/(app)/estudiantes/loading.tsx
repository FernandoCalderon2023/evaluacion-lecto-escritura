export default function EstudiantesLoading() {
  return (
    <div className="p-4 lg:p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg" />
      </div>

      <div className="h-10 bg-slate-100 rounded-lg" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-slate-300 rounded" />
                <div className="h-3 w-40 bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
