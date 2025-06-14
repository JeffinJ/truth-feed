export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-700">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-300">Loading content...</p>
            </div>
        </div>
    );
  }