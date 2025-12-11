import { Sidebar } from '@/components/layout/sidebar';

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white flex flex-row font-sans text-[#37352f]">
            <Sidebar />
            <div className="flex-1 h-screen overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
