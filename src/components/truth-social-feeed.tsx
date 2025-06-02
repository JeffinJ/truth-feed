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
        <div className="max-w-4xl mx-auto ring-1 ring-gray-700 rounded bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 text-white p-4 flex items-center justify-between rounded-t">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold">Truth Social</h1>
                    <span className="text-sm text-gray-400">
                        ({truths.length} posts)
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${statusConfig.bg} animate-pulse`}
                            title={statusConfig.text}
                            aria-label={`Connection status: ${statusConfig.text}`}
                        />
                        <span className={`text-sm ${statusConfig.textColor}`}>
                            {statusConfig.text}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {connectionStatus === "error" && (
                            <button
                                onClick={handleRetry}
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                title="Retry connection"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Feed */}
            <main className="divide-y divide-gray-700 max-h-2/5 overflow-y-auto">
                {truths.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <div className="space-y-2">
                            <p>Waiting for posts...</p>
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