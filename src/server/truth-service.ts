import "server-only";
import { TruthResponse } from "@/types/truth.types";

export const getInitialTruths = async (): Promise<TruthResponse | null> => {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TRUTH_API;
        if (!API_BASE_URL) throw new Error("API URL is not defined");
        const API_URL = `${API_BASE_URL}/truths/latest`;
        const response = await fetch(API_URL, {
            signal: AbortSignal.timeout(10000),
            next: {
                revalidate: 60, // Revalidate every 60 seconds
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("Content not found");
            else if (response.status === 500) throw new Error("Server error - please try again later");
            else if (response.status >= 400) throw new Error(`Request failed (${response.status})`);
            throw new Error("Failed to fetch content");
        }

        const data = await response.json();
        return data as TruthResponse;

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error("Request timed out - please check your connection");
            } else if (error.message.includes('fetch')) {
                throw new Error("Network error - please check your connection");
            }
            throw error;
        }
        throw new Error("An unexpected error occurred");
    }
}