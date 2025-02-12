export const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow p-6">
        <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);
