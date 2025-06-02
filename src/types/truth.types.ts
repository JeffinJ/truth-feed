export type Truth = {
    id: string;
    content: string;
    media_urls: string[];
    timestamp: string;
    ai_context: string;
    url: string;
};

export type TruthResponse = {
    data: Truth[];
    has_more: boolean;
    next_offset: number;
};