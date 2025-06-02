'use client';

import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Page error:', error);
        //TODO: handle error logging or reporting
    }, [error]);

    return (
        <div className="bg-[#050A0F] min-h-screen p-5 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                    <TriangleAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
                    <p className="text-gray-400 mb-6">
                        We encountered an error while loading the content. Please try again.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Try again
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-800 rounded text-xs text-red-400 overflow-auto">
                            {error.message}
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}