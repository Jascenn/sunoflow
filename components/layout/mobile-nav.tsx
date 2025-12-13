'use client';

import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav({ onSettingsClick }: { onSettingsClick?: () => void }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white md:hidden shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <Image src="/logo.png" alt="SunoFlow" fill className="object-cover" sizes="32px" />
                </div>
                <span className="font-bold text-lg tracking-tight">SunoFlow</span>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-stone-500">
                        <Menu className="w-6 h-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <Sidebar
                        onSettingsClick={() => {
                            if (onSettingsClick) onSettingsClick();
                            setOpen(false);
                        }}
                        onNavigate={() => setOpen(false)}
                        className="w-full h-full border-none relative"
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
