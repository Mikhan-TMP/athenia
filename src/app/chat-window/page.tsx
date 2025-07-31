'use client';
import ChatSidebar from "@/components/chatwindow/chat-sidebar";
import ChatWindow  from "@/components/chatwindow/chat-window";
import { AnimatedBackground } from "@/components/animated-background";
import { useState, useEffect } from "react";

export default function ChatWindowPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size for overlay logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
                setIsMobile(true);
            } else {
                setSidebarOpen(true);
                setIsMobile(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen w-full relative">
            {/* Overlay for mobile */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className={`z-50 ${isMobile ? "fixed" : ""}`}>
                {sidebarOpen && (
                    <ChatSidebar
                        onSidebarToggle={() => setSidebarOpen((open) => !open)}
                        sidebarOpen={sidebarOpen}
                    />
                )}
            </div>
            <div className="flex-1 h-screen w-full min-h-screen relative overflow-hidden ">
                <AnimatedBackground  />
                <ChatWindow
                    onSidebarToggle={() => setSidebarOpen((open) => !open)}
                    sidebarOpen={sidebarOpen}
                />
            </div>
        </div>
    );
}
