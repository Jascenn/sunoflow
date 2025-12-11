'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { SettingsPanel } from '@/components/dashboard/settings-panel';
import { UserMenuPanel } from '@/components/dashboard/user-menu';
import { GlobalPlayer } from '@/components/music/global-player';

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
        <div className="min-h-screen bg-white flex flex-row font-sans text-[#37352f]">
            <Sidebar onSettingsClick={() => setShowSettings(true)} />
            <div className="flex-1 h-screen overflow-hidden">
                {children}
            </div>
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
            {showUserMenu && <UserMenuPanel onClose={() => setShowUserMenu(false)} />}
            <GlobalPlayer />
        </div>
    );
}
