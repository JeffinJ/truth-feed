export type ProcessedPart = string | { text: string; href: string };
export type ProcessedContent = ProcessedPart[];

interface ProcessHtmlOptions {
    preserveLinks?: boolean;
    stripPTags?: boolean;
    processEllipsis?: boolean;
    processQuotes?: boolean;
}

const DEFAULT_OPTIONS: ProcessHtmlOptions = {
    preserveLinks: true,
    stripPTags: true,
    processEllipsis: true,
    processQuotes: true,
};

/**
 * Processes HTML content by cleaning tags, extracting links, and handling special formatting
 */
export const processHtmlContent = (
    htmlContent: string,
    options: ProcessHtmlOptions = {}
): ProcessedContent => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (!htmlContent || typeof htmlContent !== 'string') {
        return [''];
    }

    try {
        let cleanContent = htmlContent;

        // Strip paragraph tags if requested
        if (opts.stripPTags) {
            cleanContent = cleanContent.replace(/<\/?p>/g, '');
        }

        // Process quote spans if requested
        if (opts.processQuotes) {
            cleanContent = cleanContent.replace(
                /<span class="quote-inline"><br\/>RT: ([^<]*)<\/span>/g,
                'RT: $1'
            );
        }

        // If we don't need to preserve links, just strip all HTML and return
        if (!opts.preserveLinks) {
            return [cleanContent.replace(/<[^>]*>/g, '')];
        }

        // Extract and process links
        return extractAndProcessLinks(cleanContent, opts);
    } catch (error) {
        console.warn('Error processing HTML content:', error);
        return [htmlContent]; // Return original content as fallback
    }
};

/**
 * Extracts links from HTML content and processes ellipsis formatting
 */
const extractAndProcessLinks = (
    content: string,
    options: ProcessHtmlOptions
): ProcessedContent => {
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
    const parts: ProcessedContent = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            const textBefore = content.slice(lastIndex, match.index);
            const cleanedText = textBefore.replace(/<[^>]*>/g, '');
            if (cleanedText) {
                parts.push(cleanedText);
            }
        }

        const href = match[1];
        let linkText = match[2];

        // Process ellipsis in link text if requested
        if (options.processEllipsis && linkText.includes('ellipsis')) {
            linkText = processEllipsisText(linkText);
        } else {
            linkText = linkText.replace(/<[^>]*>/g, '');
        }

        parts.push({ text: linkText, href });
        lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text after the last link
    if (lastIndex < content.length) {
        const remainingText = content.slice(lastIndex);
        const cleanedText = remainingText.replace(/<[^>]*>/g, '');
        if (cleanedText) {
            parts.push(cleanedText);
        }
    }

    return parts.length > 0 ? parts : [content.replace(/<[^>]*>/g, '')];
};

/**
 * Processes ellipsis formatting in link text
 */
const processEllipsisText = (linkText: string): string => {
    const spans = linkText.match(/<span[^>]*>(.*?)<\/span>/g);

    if (spans && spans.length >= 3) {
        const visible1 = spans[0].replace(/<[^>]*>/g, '');
        const ellipsis = spans[1].replace(/<[^>]*>/g, '');
        const visible2 = spans[2].replace(/<[^>]*>/g, '');
        return `${visible1}${ellipsis}${visible2}`;
    }

    return linkText.replace(/<[^>]*>/g, '');
};


/**
 * Converts processed content to plain text
 */
export const processedContentToText = (processedContent: ProcessedContent): string => {
    return processedContent
        .map(part => typeof part === 'string' ? part : part.text)
        .join('');
};
