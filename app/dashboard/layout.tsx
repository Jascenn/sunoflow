'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { SettingsPanel } from '@/components/dashboard/settings-panel';
import { UserMenuPanel } from '@/components/dashboard/user-menu';
import { GlobalPlayer } from '@/components/music/global-player';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Register global callbacks for child components to trigger panels
    useEffect(() => {
        (window as any).__openUserPanel = () => setShowUserMenu(true);
        return () => {
            delete (window as any).__openUserPanel;
        };
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#37352f]">
            <MobileNav onSettingsClick={() => setShowSettings(true)} />

            <div className="hidden md:block h-screen sticky top-0">
                <Sidebar onSettingsClick={() => setShowSettings(true)} />
            </div>

            <main className="flex-1 h-[calc(100vh-65px)] md:h-screen overflow-hidden relative">
                {children}
            </main>

            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
            {showUserMenu && <UserMenuPanel onClose={() => setShowUserMenu(false)} />}
            <GlobalPlayer />
        </div>
    );
}
