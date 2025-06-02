export type ConnectionStatus = "connecting" | "connected" | "error" | "disconnected";
export const CONNECTION_STATUS_CONFIG = {
    connecting: {
        bg: "bg-yellow-500",
        text: "Connecting...",
        textColor: "text-yellow-200"
    },
    connected: {
        bg: "bg-green-500",
        text: "Connected",
        textColor: "text-green-200"
    },
    error: {
        bg: "bg-red-500",
        text: "Connection Error",
        textColor: "text-red-200"
    },
    disconnected: {
        bg: "bg-gray-500",
        text: "Disconnected",
        textColor: "text-gray-200"
    }
} as const;