import { TriangleAlert } from "lucide-react";

export default function ErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="bg-[#050A0F] min-h-screen flex items-center justify-center p-5">
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <TriangleAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        </div>
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-300 mb-6">
          {error.message || "Failed to load content. Please try again."}
        </p>
        {reset && (
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}