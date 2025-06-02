import "server-only";
import https from 'https';
import { TruthResponse } from "@/types/truth.types";

const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
});

const ABORT_TIMEOUT = 15000;

export const getInitialTruths = async (): Promise<TruthResponse | null> => {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_TRUTH_API;
        if (!API_BASE_URL) throw new Error("API URL is not defined");
        const API_URL = `${API_BASE_URL}/truths/latest`;

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            ...(API_URL.startsWith('https') && {
                agent: httpsAgent
            }),
            signal: AbortSignal.timeout(ABORT_TIMEOUT),
        });

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            if (response.status === 404) throw new Error("Content not found");
            else if (response.status === 500) throw new Error("Server error - please try again later");
            else if (response.status >= 400) throw new Error(`Request failed (${response.status})`);
            throw new Error("Failed to fetch content");
        }

        const data = await response.json();
        return data as TruthResponse;

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching initial truths:", error);
            if (error.name === 'AbortError') {
                throw new Error("Request timed out - please check your connection");
            } else if (error.message.includes('self-signed certificate') ||
                error.message.includes('DEPTH_ZERO_SELF_SIGNED_CERT')) {
                // deploy backend service has self-signed certificate. additional env added in vercel environment
                // NODE_TLS_REJECT_UNAUTHORIZED = 0
                throw new Error("SSL certificate verification failed - API may be using self-signed certificate");
            } else if (error.message.includes('ECONNRESET') ||
                error.message.includes('ECONNREFUSED')) {
                throw new Error("Connection refused - please check if the API server is running");
            } else if (error.message.includes('fetch')) {
                throw new Error("Network error - please check your connection");
            }
            throw error;
        }
        throw new Error("An unexpected error occurred");
    }
}