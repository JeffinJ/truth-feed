import { Truth } from '@/types/truth.types';
import Image from 'next/image';
import React from 'react';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type TruthPostProps = {
    truth: Truth
};

const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "yyyy-MM-dd HH:mm:ss");
};

export default function TruthPost({ truth }: TruthPostProps) {

    const renderContent = (htmlContent: string) => {
        const cleanContent = htmlContent.replace(/<\/?p>/g, '');

        const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
        const parts: (string | { text: string; href: string })[] = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(cleanContent)) !== null) {
            if (match.index > lastIndex) {
                parts.push(cleanContent.slice(lastIndex, match.index));
            }

            const href = match[1];
            let linkText = match[2];

            if (linkText.includes('ellipsis')) {
                const spans = linkText.match(/<span[^>]*>(.*?)<\/span>/g);
                if (spans && spans.length >= 3) {
                    const visible1 = spans[0].replace(/<[^>]*>/g, '');
                    const ellipsis = spans[1].replace(/<[^>]*>/g, '');
                    const visible2 = spans[2].replace(/<[^>]*>/g, '');
                    linkText = `${visible1}${ellipsis}${visible2}`;
                } else {
                    linkText = linkText.replace(/<[^>]*>/g, '');
                }
            } else {
                linkText = linkText.replace(/<[^>]*>/g, '');
            }

            parts.push({ text: linkText, href });
            lastIndex = linkRegex.lastIndex;
        }

        if (lastIndex < cleanContent.length) {
            parts.push(cleanContent.slice(lastIndex));
        }

        const processedParts = parts.map(part => {
            if (typeof part === 'string') {
                const processed = part.replace(
                    /<span class="quote-inline"><br\/>RT: ([^<]*)<\/span>/g,
                    'RT: $1'
                );
                return processed.replace(/<[^>]*>/g, '');
            }
            return part;
        });

        return (
            <>
                {processedParts.map((part, index) => {
                    if (typeof part === 'string') {
                        return <span key={index}>{part}</span>;
                    } else {
                        return (
                            <a
                                key={index}
                                href={part.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                {part.text}
                            </a>
                        );
                    }
                })}
            </>
        );
    };

    const renderContentAsText = (htmlContent: string) => {
        let cleanContent = htmlContent.replace(/<\/?p>/g, '');
        cleanContent = cleanContent.replace(
            /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,
            (match, href, text) => {
                if (text.includes('ellipsis')) {
                    const spans = text.match(/<span[^>]*>(.*?)<\/span>/g);
                    if (spans && spans.length >= 3) {
                        const visible1 = spans[0].replace(/<[^>]*>/g, '');
                        const ellipsis = spans[1].replace(/<[^>]*>/g, '');
                        const visible2 = spans[2].replace(/<[^>]*>/g, '');
                        return `${visible1}${ellipsis}${visible2}`;
                    }
                }
                return text.replace(/<[^>]*>/g, '');
            }
        );
        cleanContent = cleanContent.replace(
            /<span class="quote-inline"><br\/>RT: ([^<]*)<\/span>/g,
            'RT: $1'
        );
        return cleanContent.replace(/<[^>]*>/g, '');
    };

    return (
        <Accordion type="single" collapsible className="w-full text-white">
            <AccordionItem value={truth.id.toString()} >
                <AccordionTrigger>
                    <div className="px-2 text-white grid grid-cols-5 w-full">
                        <div className='col-span-1 items-center justify-center flex'>
                            {truth.timestamp ? formatTimestamp(truth.timestamp) : 'Unknown date'}
                        </div>
                        <div className='col-span-4 p-2 truncate'>
                            {renderContentAsText(truth.content)}
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className='px-8'>
                    <div className='flex flex-col gap-y-4 divide-y divide-gray-900'>
                        <div className='py-2'>
                            {renderContent(truth.content)}
                        </div>
                        {truth.media_url && truth.media_url.length > 0 && (
                            <div className="mb-3">
                                <div className="text-sm font-medium mb-2">
                                    Media ({truth.media_url.length}):
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {truth.media_url.map((url, index) => (
                                        <div key={index} className="relative">
                                            <Image
                                                src={url}
                                                alt={`Media ${index + 1}`}
                                                className="w-full h-48 object-cover rounded border"
                                                width={500}
                                                height={300}
                                                loading="lazy"
                                                onError={(e: unknown) => {
                                                    console.error("Image failed to load:", e);
                                                }}
                                            />
                                            <div
                                                className="w-full h-48 bg-gray-200 rounded border flex items-center justify-center"
                                            >
                                                Image failed to load
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="">
                            <div className='text-sky-500 font-semibold'>
                                🪄 AI Overview
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}