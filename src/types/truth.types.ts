export type Truth = {
    id: number;
    content: string;
    media_url: string[];
    timestamp: string;
    url: string;
};

export type TruthResponse = {
    data: Truth[];
    has_more: boolean;
    next_offset: number;
};