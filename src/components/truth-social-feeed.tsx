"use client";

import { TruthResponse } from "@/types/truth.types";
import TruthPost from "./truth-post";
import { useTruthSocialFeed } from "@/hooks/truth-stream-hook";
import { CONNECTION_STATUS_CONFIG } from "@/types/sse.types";

type TruthSocialFeedProps = {
    initialTruths: TruthResponse
};

export default function TruthSocialFeed({ initialTruths }: TruthSocialFeedProps) {

    const {
        truths,
        connectionStatus,
        reconnect,
    } = useTruthSocialFeed({
        initialTruths: initialTruths.data || [],
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectDelay: 3000
    });

    const statusConfig = CONNECTION_STATUS_CONFIG[connectionStatus];

    const handleRetry = () => {
        reconnect();
    };

    return (
        <div className="w-full max-w-4xl mx-auto ring-1 ring-gray-700 rounded bg-gray-900 m-2 sm:m-4">
            {/* Header */}
            <header className="bg-gray-800 text-white p-3 sm:p-4 flex flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 rounded-t">
                <div className="flex items-center gap-3 ">
                    <h1 className="text-base sm:text-lg font-semibold">Truth Social</h1>
                    <span className="text-xs sm:text-sm text-gray-400">
                        ({truths.length} posts)
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-fit ">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${statusConfig.bg} animate-pulse`}
                            title={statusConfig.text}
                            aria-label={`Connection status: ${statusConfig.text}`}
                        />
                        <span className={`text-xs sm:text-sm ${statusConfig.textColor}`}>
                            {statusConfig.text}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    {connectionStatus === "error" && (
                        <div className="flex gap-2">

                            <button
                                onClick={handleRetry}
                                className="px-2 sm:px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                title="Retry connection"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Feed */}
            <main className="divide-y divide-gray-700 h-[100vh] sm:h-[60vh] md:h-[80vh] lg:h-[75vh] xl:h-[80vh] 2xl:h-[85vh] overflow-y-auto">
                {truths.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-400 px-4">
                        <div className="space-y-2">
                            <p className="text-sm sm:text-base">Waiting for posts...</p>
                            {connectionStatus === "error" && (
                                <button
                                    onClick={handleRetry}
                                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                                >
                                    Try reconnecting
                                </button>
                            )}
                        </div>
                    </div>
                ) : (truths.map((truth) => (
                    <TruthPost
                        key={truth.id}
                        truth={truth}
                    />
                )))}
            </main>
        </div>
    );
};