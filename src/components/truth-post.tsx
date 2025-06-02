import { Truth } from '@/types/truth.types';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ProcessedContent, processHtmlContent } from '@/lib/truth.utils';
import Link from 'next/link';

type TruthPostProps = {
    truth: Truth
};

const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
        date: format(date, "yyyy-MM-dd"),
        time: format(date, "HH:mm")
    };
};

const renderContent = (
    processedContent: ProcessedContent,
    linkClassName = "text-blue-400 hover:text-blue-300 underline"
): React.ReactNode => {
    return (
        <>
            {processedContent.map((part, index) => {
                if (typeof part === 'string') {
                    return <span key={index}>{part}</span>;
                } else {
                    return (
                        <Link
                            key={index}
                            href={part.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClassName}
                        >
                            {part.text}
                        </Link>
                    );
                }
            })}
        </>
    );
};

export default function TruthPost({ truth }: TruthPostProps) {
    const { date, time } = formatDateTime(truth.timestamp);

    const processedContentToText = (processedContent: ProcessedContent): string => {
        return processedContent
            .map(part => typeof part === 'string' ? part : part.text)
            .join('');
    };

    const renderTitle = useMemo(() => {
        return (htmlContent: string, linkClassName?: string): React.ReactNode => {
            const processed = processHtmlContent(htmlContent, { preserveLinks: true });
            return renderContent(processed, linkClassName);
        };
    }, []);

    const renderContentAsText = useMemo(() => {
        return (htmlContent: string): string => {
            const processed = processHtmlContent(htmlContent, { preserveLinks: false });
            return processedContentToText(processed);
        };
    }, []);


    return (
        <Accordion type="single" collapsible className="w-full text-white">
            <AccordionItem value={truth.id.toString()} className='px-5 sm:px-14' >
                <AccordionTrigger>
                    <div className=" text-white grid grid-cols-4 sm:grid-cols-8 w-full">
                        <div className='col-span-1 items-start justify-start flex'>
                            {truth.timestamp ? (
                                <div className='flex flex-col items-start justify-start sm:justify-center text-xs text-gray-400'>
                                    {/* show date on mobile screens */}
                                    <div className='hidden sm:block'>{date}</div>
                                    <div>{time}</div>
                                </div>
                            ) : "No timestamp available"}
                        </div>
                        <div className='col-span-3 sm:col-span-7 flex flex-col justify-start '>
                            <div className='line-clamp-2 text-sm sm:text-base'>
                                {renderContentAsText(truth.content)}
                            </div>
                            <div>
                                {truth.media_urls && truth.media_urls.length > 0 && (
                                    <span className="text-sky-500 text-sm ">
                                        {truth.media_urls.length} media item{truth.media_urls.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className=''>
                    <div className='flex flex-col w-full gap-y-4 divide-y divide-gray-900'>
                        <div className='py-2'>
                            {renderTitle(truth.content, "text-pretty text-sky-500 hover:text-sky-400")}
                        </div>
                        <div>
                            <Link
                                href={truth.url}
                                target="_blank"
                                className="text-violet-300 hover:text-blue-300 underline text-sm">
                                Open in Truth Social
                            </Link>
                        </div>
                        {truth.media_urls && truth.media_urls.length > 0 && (
                            <div className="">
                                <div className="text-sm mb-2 text-sky-500 font-semibold">
                                    Attached Media ({truth.media_urls.length}):
                                </div>
                                <div className="flex flex-wrap">
                                    {truth.media_urls.map((url, index) => (
                                        <div key={index} className="rouded-lg">
                                            {url.endsWith('.mp4') ? (
                                                <video
                                                    src={url}
                                                    controls
                                                    className="max-w-full h-auto rounded-lg mb-2"
                                                />
                                            ) : (
                                                <Image
                                                    src={url}
                                                    alt={`Media ${index + 1}`}
                                                    width={500}
                                                    height={500}
                                                    className="max-w-full h-auto rounded-lg mb-2"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="">
                            <div className='text-sky-500 font-semibold leading-10'>
                                🪄 Context (AI generated)
                            </div>
                            <div className='text-pretty px-1 text-slate-300'>
                                {truth.ai_context ? truth.ai_context : 'No AI context available for this post.'}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}