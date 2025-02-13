export const StatCardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
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
