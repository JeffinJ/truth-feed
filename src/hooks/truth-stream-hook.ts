"use client"

import { ConnectionStatus } from "@/types/sse.types";
import { Truth } from "@/types/truth.types";
import { useEffect, useState, useCallback, useRef } from "react";


type UseTruthSocialFeedOptions = {
    initialTruths?: Truth[];
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
};

type UseTruthSocialFeedReturn = {
    truths: Truth[];
    connectionStatus: ConnectionStatus;
    connect: () => void;
    disconnect: () => void;
    reconnect: () => void;
};

export function useTruthSocialFeed(options: UseTruthSocialFeedOptions = {}): UseTruthSocialFeedReturn {
    const {
        initialTruths = [],
        autoReconnect = true,
        maxReconnectAttempts = 3,
        reconnectDelay = 2000
    } = options;

    const [truths, setTruths] = useState<Truth[]>(initialTruths);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const addNewTruths = useCallback((newTruths: Truth[]) => {
        setTruths(prevTruths => {
            // Prevent duplicates by filtering out truths that already exist
            const existingIds = new Set(prevTruths.map(t => t.id));
            const uniqueNewTruths = newTruths.filter(truth => !existingIds.has(truth.id));
            return [...uniqueNewTruths, ...prevTruths];
        });
    }, []);

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        clearReconnectTimeout();
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setConnectionStatus("disconnected");
    }, [clearReconnectTimeout]);

    const handleEventSourceError = useCallback(() => {
        setConnectionStatus("error");
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
        }
    }, [autoReconnect, maxReconnectAttempts, reconnectDelay]);

    const connect = useCallback(() => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TRUTH_API;

        if (!API_BASE_URL) {
            console.error("NEXT_PUBLIC_TRUTH_API is not defined");
            setConnectionStatus("error");
            return;
        }

        // Clean up existing connection
        disconnect();
        setConnectionStatus("connecting");

        try {
            const eventSource = new EventSource(`${API_BASE_URL}/truths-sse/stream`);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setConnectionStatus("connected");
                reconnectAttemptsRef.current = 0; // Reset on successful connection
                console.log("SSE connection established");
            };

            eventSource.onerror = handleEventSourceError;

            eventSource.addEventListener("new_truths", (event) => {
                try {
                    const { data: truthsArray } = JSON.parse(event.data);
                    if (Array.isArray(truthsArray) && truthsArray.length > 0) {
                        addNewTruths(truthsArray);
                    }
                } catch (error) {
                    console.error("Failed to parse new truths:", error);
                }
            });

            eventSource.addEventListener("connected", (event) => {
                console.log("SSE Connected:", event.data);
            });

            eventSource.addEventListener("heartbeat", (event) => {
                console.log("SSE Heartbeat:", event.data);
            });

        } catch (error) {
            console.error("Failed to create EventSource:", error);
            setConnectionStatus("error");
        }
    }, [disconnect, handleEventSourceError, addNewTruths]);

    const reconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        connect();
    }, [connect]);

    useEffect(() => {
        connect();

        return () => {
            clearReconnectTimeout();
            disconnect();
        };
    }, [connect, disconnect, clearReconnectTimeout]);

    return {
        truths,
        connectionStatus,
        connect,
        disconnect,
        reconnect,
    };
}