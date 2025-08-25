import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <ImageOff className="w-24 h-24 text-gray-400 dark:text-gray-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Wallpaper Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          The wallpaper you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </div>
    </div>
  );
}
