export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="flex gap-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
