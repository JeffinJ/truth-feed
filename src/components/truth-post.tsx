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
        let cleanContent = htmlContent.replace(/<\/?p>/g, '');
        cleanContent = cleanContent.replace(
            /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,
            (match, href, text) => {
                // For Truth Social links with ellipsis, try to reconstruct
                if (text.includes('ellipsis')) {
                    const spans = text.match(/<span[^>]*>(.*?)<\/span>/g);
                    if (spans && spans.length >= 3) {
                        const visible1 = spans[0].replace(/<[^>]*>/g, '');
                        const ellipsis = spans[1].replace(/<[^>]*>/g, '');
                        const visible2 = spans[2].replace(/<[^>]*>/g, '');
                        return `${visible1}${ellipsis}${visible2} (${href})`;
                    }
                }
                return `${text.replace(/<[^>]*>/g, '')} (${href})`;
            }
        );

        cleanContent = cleanContent.replace(
            /<span class="quote-inline"><br\/>RT: ([^<]*)<\/span>/g,
            'RT: $1'
        );
        cleanContent = cleanContent.replace(/<[^>]*>/g, '');
        return cleanContent;
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
                            {renderContent(truth.content)}
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
                                <div className="text-sm font-medium   mb-2">
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
                                                className="w-full h-48 bg-gray-200 rounded border flex items-center justify-center  "
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
    )

    return (
        <div className="p-4 mb-4 shadow-sm text-white grid grid-cols-3">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">

                <div className="text-sm  ">
                    {truth.timestamp ? formatTimestamp(truth.timestamp) : 'Unknown date'}
                </div>
            </div>

            {/* Content */}
            <div className="mb-3">
                <div className="whitespace-pre-wrap leading-relaxed">
                </div>
            </div>

            {/* Media URLs */}
            {/* <div>
                {truth.media_url && truth.media_url.length > 0 && (
                    <div className="mb-3">
                        <div className="text-sm font-medium   mb-2">
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
                                        className="hidden w-full h-48 bg-gray-200 rounded border flex items-center justify-center  "
                                    >
                                        Image failed to load
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div> */}

            <div className="">
                <a
                    href={truth.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    View on Truth Social →
                </a>
            </div>
        </div>
    );
};
