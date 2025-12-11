'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LyricsDialogProps {
    title: string;
    lyrics?: string;
    trigger?: React.ReactNode;
}

export function LyricsDialog({ title, lyrics, trigger }: LyricsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (lyrics) {
            navigator.clipboard.writeText(lyrics);
            setCopied(true);
            toast.success('Lyrics copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!lyrics) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-xl">🎵</span>
                        <span className="truncate max-w-[300px]">{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[300px] relative bg-gray-50/50 rounded-md mt-2">
                    <ScrollArea className="h-full w-full p-6">
                        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-700 text-center">
                            {lyrics}
                        </div>
                    </ScrollArea>

                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="bg-white/90 hover:bg-white backdrop-blur shadow-sm border border-gray-200 p-2 rounded-md transition-all text-gray-500 hover:text-gray-900"
                            title="Copy Lyrics"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
