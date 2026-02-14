'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useDeriverseData } from '@/hooks/useDeriverseData';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Initialize data fetching — populates Zustand store
    useDeriverseData();

    return (
        <div className="min-h-screen bg-background">

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen transition-[margin] duration-300">
                <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

                <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
