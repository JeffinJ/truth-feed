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

    const [truthsMap, setTruthsMap] = useState<Map<string, Truth>>(() => {
        const map = new Map<string, Truth>();
        initialTruths.forEach(truth => {
            map.set(truth.id, truth);
        });
        return map;
    });

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const addNewTruthsToMap = useCallback((newTruths: Truth[]) => {
        setTruthsMap(prevMap => {
            const updatedMap = new Map(prevMap);
            newTruths.forEach(truth => {
                if (!updatedMap.has(truth.id)) {
                    updatedMap.set(truth.id, truth);
                }
            });
            return updatedMap;
        });
    }, []);


    const updateTruthsMap = useCallback((updatedTruths: Truth[]) => {
        setTruthsMap(prevMap => {
            const updatedMap = new Map(prevMap);
            updatedTruths.forEach(truth => {
                if (updatedMap.has(truth.id)) {
                    updatedMap.set(truth.id, { ...updatedMap.get(truth.id), ...truth });
                }
            });
            return updatedMap;
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

        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

            reconnectTimeoutRef.current = setTimeout(() => {
                // Attempt to reconnect
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

        disconnect();
        setConnectionStatus("connecting");

        try {
            const eventSource = new EventSource(`${API_BASE_URL}/truths-sse/stream`);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setConnectionStatus("connected");
                reconnectAttemptsRef.current = 0;
                console.log("SSE connection established");
            };

            eventSource.onerror = handleEventSourceError;

            eventSource.addEventListener("truths", (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    const eventType = parsed.type;
                    const truthData: Truth[] = parsed.data;

                    switch (eventType) {
                        case "new_truths":
                            if (Array.isArray(truthData) && truthData.length > 0) addNewTruthsToMap(truthData);
                            break;
                        case "truth_ai_update":
                            if (Array.isArray(truthData) && truthData.length > 0) updateTruthsMap(truthData);
                            break;
                        default:
                            console.warn(`Unhandled event type: ${eventType}`);
                            break;
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
    }, [addNewTruthsToMap, disconnect, handleEventSourceError, updateTruthsMap]);

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
        truths: Array.from(truthsMap.values()),
        connectionStatus,
        connect,
        disconnect,
        reconnect,
    };
}