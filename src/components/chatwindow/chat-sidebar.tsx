"use client";

import { useState } from "react";
import { MessageSquarePlus, Settings, Search, MoreHorizontal, Trash2, PanelLeftIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatSidebar({ onSidebarToggle, sidebarOpen }: { onSidebarToggle: () => void, sidebarOpen: boolean }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedChat, setSelectedChat] = useState<number | null>(1)
    // const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <div className="w-80 h-screen bg-[rgba(26,30,44,1)] flex flex-col z-99 absolute md:relative ">
            <div className="flex-1 flex flex-col">
                {/* LOGO */}
                <div className="select-none flex justify-between items-center p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-white/5 bg-[rgba(26,30,44,1)]">
                    <h1 className="text-2xl font-bold text-white text-center">AI LIBRARIAN</h1>
                    <PanelLeftIcon
                        className="md:hidden lg:hidden"
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={onSidebarToggle}
                    />
                </div>
                {/* NEW CHAT */}
                <div className="p-4 bg-[rgba(26,30,44,1)]">
                    <button className="cursor-pointer rounded-lg flex justify-center items-center w-full h-12 w-full gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white border-none shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
                    <MessageSquarePlus className="h-4 w-4" />
                    New Chat
                    </button>
                </div>
                {/* SEARCH */}
                <div className="bg-[rgba(26,30,44,1)] flex min-h-0 flex-col gap-2 overflow-auto">
                    <label className="text-sidebar-foreground/70 ring-sidebar-ring flex shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden text-[#bdb4b4f7]">
                        Search Chats
                    </label>
                    <div className="relative px-5 py-2">
                    <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-white/40 focus:border-orange-500/25 focus:ring-orange-500/20 w-full h-10 rounded-md"
                    />
                    </div>
                </div>
                {/* RECENT CHATS */}
                <div className="border-b  border-white/5 bg-[rgba(13, 17, 31, 1)] flex min-h-0 flex-col gap-2 overflow-auto overflow-y-auto h-[500px]">
                    <label className="text-sidebar-foreground/70 ring-sidebar-ring flex shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden text-[#bdb4b4f7]">
                    Recent Chats
                    </label>
                    <div className="group/menu-item relative p-4 flex flex-col gap-2 ">
                        <div onClick={() => setSelectedChat(1)}
                        className={`w-full cursor-pointer rounded-xl justify-start flex-col flex p-3 h-auto hover:bg-slate-800/60 transition-all duration-200 bg-[rgba(24,27,41,1)] select-none ${
                            selectedChat === 1
                            ? "bg-gradient-to-r from-orange-500/20 via-orange-600/15 to-transparent border-l-2 border-orange-500 shadow-lg"
                            : "hover:bg-slate-800/40"
                        }`}
                        >
                            <div className="flex items-center justify-between ">
                                <div className="flex text-left flex-col">
                                    <span className="text-[#e5e5e5] text-left ">Library Hours</span>
                                    <span className="text-[#bdb4b4f7] text-[10px] text-left ">2 minutes ago</span>
                                </div>
                                <div>
                                    <button className=" h-8 w-8 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white flex items-center justify-center">
                                        <MoreHorizontal className="h-6 w-6 text-white/60" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* SETTINGS */}
            <div className=" bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-t border-white/5 bg-[rgba(26,30,44,1)]">
                <button className="cursor-pointer rounded-lg flex justify-center items-center w-full h-12 w-full gap-2  text-white  transition-all duration-300">
                    <Settings className="h-4 w-4" />
                    Settings
                </button>
            </div>
        </div>
    );
}
