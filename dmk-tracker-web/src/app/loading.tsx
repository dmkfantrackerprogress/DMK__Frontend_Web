export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      {/* Castle header */}
      <div className="h-10 w-64 rounded-lg bg-indigo-200 animate-pulse mb-8" />

      {/* Castle towers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-indigo-100 animate-pulse"
          />
        ))}
      </div>

      {/* Content blocks */}
      <div className="mt-10 space-y-4">
        <div className="h-4 w-full bg-indigo-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-indigo-100 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-indigo-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
